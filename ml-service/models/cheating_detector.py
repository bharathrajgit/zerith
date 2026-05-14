# ml-service/models/cheating_detector.py
import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

class CheatingDetector:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=200, max_depth=10,
            class_weight='balanced', random_state=42
        )
        self.is_trained = False
        self.model_path = 'trained_models/cheating_detector.pkl'
        self.features = [
            'avg_time', 'std_time', 'fast_slow_ratio',
            'tab_switches', 'copy_attempts', 'window_blur',
            'hint_rate', 'changed_answers', 'total_questions',
            'past_avg_accuracy'
        ]

    def train(self, X, y):
        self.model.fit(X, y)
        scores = cross_val_score(self.model, X, y, cv=5, scoring='accuracy')
        print(f'Cheating detector CV accuracy: {scores.mean():.4f} (±{scores.std():.4f})')
        os.makedirs('trained_models', exist_ok=True)
        joblib.dump(self.model, self.model_path)
        self.is_trained = True
        return {'accuracy': scores.mean(), 'std': scores.std()}

    def predict(self, features):
        if not self.is_trained:
            self.load_model()
        X = np.array(features).reshape(1, -1)
        proba = self.model.predict_proba(X)[0][1]  # probability of cheating
        return {
            'cheating_probability': float(proba),
            'is_suspicious': bool(proba >= 0.5)
        }

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True
        else:
            raise FileNotFoundError(
                'Cheating model not trained. Run train_cheating_model.py first.'
            )