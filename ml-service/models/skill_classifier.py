"""
skill_classifier.py
FINAL VERSION — Ensemble ML with proper validation
Place this file in: ml-service/models/skill_classifier.py
"""

import os
import numpy as np
import joblib

from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    VotingClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import (
    StratifiedKFold,
    cross_val_score,
    train_test_split
)
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)


class SkillClassifier:

    MODEL_PATH   = 'trained_models/skill_classifier.pkl'
    ENCODER_PATH = 'trained_models/skill_encoder.pkl'

    # ── Feature names (must match feature_extractor) ──
    FEATURE_NAMES = [
        'round1_accuracy',
        'round2_accuracy',
        'round3_accuracy',
        'coding_accuracy',
        'avg_response_time',
        'hint_usage_rate',
        'attempt_count',
        'streak_day',
        'skip_attempts',
        'topics_studied_count',
        'conceptual_error_rate',
        'application_error_rate',
        'reasoning_error_rate',
    ]

    def __init__(self):
        self.label_encoder = LabelEncoder()
        self.is_trained    = False
        self._build_model()

    def _build_model(self):
        """Build the ensemble model."""
        rf = RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        gb = GradientBoostingClassifier(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            min_samples_split=5,
            random_state=42
        )
        lr = LogisticRegression(
            max_iter=1000,
            class_weight='balanced',
            random_state=42,
            C=1.0
        )
        self.model = VotingClassifier(
            estimators=[
                ('random_forest', rf),
                ('gradient_boost', gb),
                ('logistic_reg',  lr)
            ],
            voting='soft',
            weights=[3, 2, 1]
        )

    def train(self, X, y):
        """
        Train with 5-fold cross-validation.
        Returns dict with cv_mean_accuracy and all metrics.
        """
        print(f'\nTraining on {len(X)} samples, '
              f'{X.shape[1]} features...')
        print(f'Classes: {np.unique(y)}')

        # ── Encode labels ──────────────────────────────
        y_enc = self.label_encoder.fit_transform(y)

        # ── Stratified K-Fold CV ───────────────────────
        skf = StratifiedKFold(
            n_splits=5,
            shuffle=True,
            random_state=42
        )
        cv_scores = cross_val_score(
            self.model, X, y_enc,
            cv=skf,
            scoring='accuracy',
            n_jobs=-1
        )

        print(f'\nCross-Validation (5-Fold):')
        for i, s in enumerate(cv_scores, 1):
            print(f'  Fold {i}: {s:.4f}')
        print(f'  Mean:  {cv_scores.mean():.4f} '
              f'({cv_scores.mean()*100:.1f}%)')
        print(f'  Std:   {cv_scores.std():.4f}')

        # ── Train/test split for final evaluation ──────
        X_tr, X_te, y_tr, y_te = train_test_split(
            X, y_enc,
            test_size=0.20,
            stratify=y_enc,
            random_state=42
        )
        self.model.fit(X_tr, y_tr)
        y_pred = self.model.predict(X_te)

        test_acc    = accuracy_score(y_te, y_pred)
        class_names = self.label_encoder.classes_
        cm          = confusion_matrix(y_te, y_pred)
        report_dict = classification_report(
            y_te, y_pred,
            target_names=class_names,
            output_dict=True
        )

        print(f'\nTest Accuracy: {test_acc:.4f} '
              f'({test_acc*100:.1f}%)')
        print('\nClassification Report:')
        print(classification_report(
            y_te, y_pred,
            target_names=class_names
        ))
        print('Confusion Matrix:')
        print(cm)

        # ── Retrain on ALL data before saving ──────────
        self._build_model()
        self.model.fit(X, y_enc)
        self.is_trained = True

        # ── Save model + encoder ───────────────────────
        os.makedirs('trained_models', exist_ok=True)
        joblib.dump(self.model,         self.MODEL_PATH)
        joblib.dump(self.label_encoder, self.ENCODER_PATH)
        print(f'\nSaved → {self.MODEL_PATH}')

        # ── Return dict (train_models.py depends on this)
        return {
            'cv_mean_accuracy':      float(cv_scores.mean()),
            'cv_std':                float(cv_scores.std()),
            'cv_scores':             cv_scores.tolist(),
            'test_accuracy':         float(test_acc),
            'classes':               class_names.tolist(),
            'confusion_matrix':      cm.tolist(),
            'classification_report': report_dict,
        }

    def predict(self, features):
        """
        Predict level for one student.
        features: numpy array shape (13,)
        Returns: { level, confidence, probabilities }
        """
        if not self.is_trained:
            self.load_model()

        f2d      = features.reshape(1, -1)
        pred_enc = self.model.predict(f2d)[0]
        pred_lbl = self.label_encoder.inverse_transform(
            [pred_enc]
        )[0]
        proba    = self.model.predict_proba(f2d)[0]
        names    = self.label_encoder.classes_

        probabilities = {
            n: float(round(p, 4))
            for n, p in zip(names, proba)
        }

        return {
            'level':         pred_lbl,
            'confidence':    float(round(max(proba), 4)),
            'probabilities': probabilities,
        }

    def load_model(self):
        """Load saved model or train fresh if missing."""
        if (os.path.exists(self.MODEL_PATH) and
                os.path.exists(self.ENCODER_PATH)):
            self.model         = joblib.load(
                self.MODEL_PATH
            )
            self.label_encoder = joblib.load(
                self.ENCODER_PATH
            )
            self.is_trained    = True
            print('Skill classifier loaded from disk.')
        else:
            print('No model found — training now...')
            from utils.data_preprocessor import (
                generate_training_data
            )
            X, y = generate_training_data(2000)
            self.train(X, y)

    def get_feature_importance(self):
        """
        Feature importance from RF component.
        Used in training report + IEEE paper.
        """
        if not self.is_trained:
            self.load_model()

        rf_model    = self.model.named_estimators_[
            'random_forest'
        ]
        importances = rf_model.feature_importances_

        result = dict(zip(
            self.FEATURE_NAMES,
            importances.tolist()
        ))
        return dict(sorted(
            result.items(),
            key=lambda x: x[1],
            reverse=True
        ))