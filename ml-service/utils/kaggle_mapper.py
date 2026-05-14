"""Kaggle-to‑ML feature mapper – Python Learning & Exam Performance Dataset."""
import pandas as pd
import numpy as np

def map_python_learning_dataset(csv_path: str):
    """
    Reads the Kaggle 'Python Learning and Exam Performance Dataset'.
    Returns X (13 features, normalised 0–1), y (label strings).
    """
    df = pd.read_csv(csv_path)

    # ─── 1. Clean / safe columns ──────────────────────────────
    cols = {
        'previous_exam_score': 0,
        'assignment_completion_rate': 0,
        'practice_problems_solved': 0,
        'coding_challenges_completed': 0,
        'time_spent_on_coding_platform': 0,
        'debugging_sessions': 0,
        'study_hours_per_week': 0,
        'attendance_rate': 0,
        'self_reported_confidence': 0,
        'stress_level': 0,
        'sleep_hours': 0,
        'physical_activity': 0,
        'final_exam_score': 0,
        'performance_level': 'Beginner'
    }
    for col, default in cols.items():
        if col not in df.columns:
            df[col] = default

    # ─── 2. Derived max values from the dataset ───────────────
    #     (we compute from the current DataFrame so scaling is adaptive)
    max_practice = df['practice_problems_solved'].max() or 1
    max_challenges = df['coding_challenges_completed'].max() or 1
    max_debug = df['debugging_sessions'].max() or 1
    max_study = df['study_hours_per_week'].max() or 1
    max_time_platform = df['time_spent_on_coding_platform'].max() or 120

    # ─── 3. Feature extraction (13 features) ─────────────────
    X = []
    for _, row in df.iterrows():
        # round 1 accuracy – basic level (previous exam score)
        r1 = np.clip(row['previous_exam_score'] / 100.0, 0, 1)

        # round 2 accuracy – medium level (assignment completion)
        r2 = np.clip(row['assignment_completion_rate'] / 100.0, 0, 1)

        # round 3 accuracy – hard level (practice problems solved, normalised)
        r3 = np.clip(row['practice_problems_solved'] / max_practice, 0, 1)

        # coding accuracy (challenges completed ratio)
        coding = np.clip(row['coding_challenges_completed'] / max_challenges, 0, 1)

        # avg response time (minutes on platform / 120)
        resp_time = np.clip(row['time_spent_on_coding_platform'] / 120.0, 0, 1)

        # hint usage rate (debugging sessions / total attempts proxy)
        total_attempts_proxy = row['practice_problems_solved'] + row['debugging_sessions'] + 1
        hint_rate = np.clip(row['debugging_sessions'] / total_attempts_proxy, 0, 1)

        # attempt count (we approximate: 1 + study_hours/10 capped)
        attempt_count = np.clip(1 + row['study_hours_per_week'] / 10.0, 1, 20) / 20.0

        # streak day (we don't have – default 0)
        streak_day = 0.0

        # skip attempts (default 0)
        skip_attempts = 0.0

        # topics studied count (default 5)
        topics_studied_count = np.clip(5 / 11.0, 0, 1)

        # error rates derived from round scores
        conceptual_error_rate = np.clip(1 - r1, 0, 1)
        application_error_rate = np.clip(1 - r2, 0, 1)
        reasoning_error_rate = np.clip(1 - r3, 0, 1)

        features = [
            r1, r2, r3, coding, resp_time, hint_rate,
            attempt_count, streak_day, skip_attempts,
            topics_studied_count,
            conceptual_error_rate, application_error_rate, reasoning_error_rate
        ]
        X.append(features)

    X = np.array(X, dtype=np.float32)
    y = df['performance_level'].values   # strings: Beginner / Intermediate / Advanced (or Placement-Ready if mapped)

    # Optionally unify labels with our model's expected classes
    label_map = {
        'Advanced': 'Placement-Ready',
        'Intermediate': 'Intermediate',
        'Beginner': 'Beginner'
    }
    y = np.array([label_map.get(l, 'Beginner') for l in y])

    return X, y


def map_daily_coding_dataset(csv_path: str):
    """
    Reads the Kaggle 'Daily Coding Habits' dataset.
    Returns X (13 features, normalised 0-1), y (label strings).
    """
    df = pd.read_csv(csv_path)

    # ─── Defaults for possible missing columns ────────────
    defaults = {
        'time_spent_minutes': 0,
        'problems_solved': 0,
        'easy_problems_solved': 0,
        'medium_problems_solved': 0,
        'hard_problems_solved': 0,
        'streak_count': 0,
        'topics_covered': 1,
        'hints_used': 0,
        'attempts_per_problem': 1,
        'difficulty_level': 'Beginner'
    }
    for col, val in defaults.items():
        if col not in df.columns:
            df[col] = val

    # ─── Derived max values (adaptive to data) ─────────────
    max_time = df['time_spent_minutes'].max() or 120
    max_problems = df['problems_solved'].max() or 1
    max_streak = df['streak_count'].max() or 365
    max_topics = df['topics_covered'].max() or 11

    X = []
    for _, row in df.iterrows():
        # round1 : easy problems ratio
        r1 = np.clip(row['easy_problems_solved'] / max_problems, 0, 1) if max_problems > 0 else 0
        # round2 : medium problems ratio
        r2 = np.clip(row['medium_problems_solved'] / max_problems, 0, 1) if max_problems > 0 else 0
        # round3 : hard problems ratio
        r3 = np.clip(row['hard_problems_solved'] / max_problems, 0, 1) if max_problems > 0 else 0

        coding = np.clip(row['problems_solved'] / max_problems, 0, 1)
        resp_time = np.clip(row['time_spent_minutes'] / 120.0, 0, 1)
        hint_rate = np.clip(row['hints_used'] / (row['problems_solved'] + 1), 0, 1)
        attempt_count = np.clip(row['attempts_per_problem'] / 20.0, 0, 1)
        streak_day = np.clip(row['streak_count'] / 365.0, 0, 1)
        skip_attempts = 0.0
        topics_studied = np.clip(row['topics_covered'] / 11.0, 0, 1)

        conceptual_error = np.clip(1 - r1, 0, 1)
        application_error = np.clip(1 - r2, 0, 1)
        reasoning_error = np.clip(1 - r3, 0, 1)

        features = [
            r1, r2, r3, coding, resp_time, hint_rate,
            attempt_count, streak_day, skip_attempts,
            topics_studied,
            conceptual_error, application_error, reasoning_error
        ]
        X.append(features)

    X = np.array(X, dtype=np.float32)
    y = df['difficulty_level'].values

    label_map = {
        'Advanced': 'Placement-Ready',
        'Intermediate': 'Intermediate',
        'Beginner': 'Beginner'
    }
    y = np.array([label_map.get(l, 'Beginner') for l in y])
    return X, y

import os, joblib, numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

class DropoutPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=150, max_depth=10,
                                            class_weight='balanced', random_state=42)
        self.is_trained = False
        self.model_path = 'trained_models/dropout_predictor.pkl'

    def train(self, X, y):
        self.model.fit(X, y)
        scores = cross_val_score(self.model, X, y, cv=5, scoring='accuracy')
        print(f'Dropout predictor CV accuracy: {scores.mean():.4f}')
        os.makedirs('trained_models', exist_ok=True)
        joblib.dump(self.model, self.model_path)
        self.is_trained = True
        return {'accuracy': scores.mean(), 'std': scores.std()}

    def predict(self, features):
        if not self.is_trained:
            self.load_model()
        X = np.array(features).reshape(1, -1)
        proba = self.model.predict_proba(X)[0][1]
        return {'dropout_probability': float(proba), 'at_risk': proba >= 0.5}

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True

def map_oulad_dataset(csv_path: str):
    """
    Reads the OULAD (MOOC Dropout Prediction) dataset.
    Returns X (9 features, normalised 0‑1), y (dropout flag 0/1).

    Features:
        num_prev_attempts, studied_credits, avg_score,
        engagement_score, performance_score, risk_score,
        days_active, module_count, consistency
    """
    df = pd.read_csv(csv_path)

    # Normalise column names to lowercase
    df.columns = [c.lower() for c in df.columns]

    # Defaults for possibly missing columns
    defaults = {
        'num_of_prev_attempts': 0,
        'studied_credits': 60,
        'avg_score': 50,
        'engagement_level': 'medium',
        'performance_level': 'medium',
        'risk_level': 'medium',
        'final_result': 'Pass'
    }
    for col, val in defaults.items():
        if col not in df.columns:
            df[col] = val

    # Map engagement, performance, risk to numeric (0-1)
    def map_level(val, mapping):
        return mapping.get(str(val).lower(), 0.5)

    eng_map = {'low': 0.2, 'medium': 0.5, 'high': 0.8}
    perf_map = {'low': 0.3, 'medium': 0.6, 'high': 0.9}
    risk_map = {'low': 0.1, 'medium': 0.5, 'high': 0.9}

    df['engagement_score'] = df['engagement_level'].apply(lambda x: map_level(x, eng_map))
    df['performance_score'] = df['performance_level'].apply(lambda x: map_level(x, perf_map))
    df['risk_score'] = df['risk_level'].apply(lambda x: map_level(x, risk_map))

    # Days active derived from registration/unregistration dates if available
    df['days_active'] = 0
    if 'date_registration' in df.columns and 'date_unregistration' in df.columns:
        df['date_registration'] = pd.to_datetime(df['date_registration'], errors='coerce')
        df['date_unregistration'] = pd.to_datetime(df['date_unregistration'], errors='coerce')
        df['days_active'] = (df['date_unregistration'] - df['date_registration']).dt.days
        df['days_active'] = df['days_active'].fillna(0).clip(0, 365)
    elif 'module_presentation_length' in df.columns:
        df['days_active'] = df['module_presentation_length'].fillna(0)

    # Number of previous attempts (capped at 10)
    df['num_of_prev_attempts'] = df['num_of_prev_attempts'].clip(0, 10)

    # Studied credits (max 180)
    df['studied_credits'] = df['studied_credits'].clip(0, 180)

    # Average score (0-100)
    df['avg_score'] = df['avg_score'].clip(0, 100)

    # Dropout flag from final_result (this is the label ONLY)
    dropout_map = {'withdrawn': 1, 'fail': 1, 'pass': 0, 'distinction': 0}
    y = df['final_result'].apply(lambda x: dropout_map.get(str(x).lower(), 0)).values

    # Module count (approximate from code_module if available)
    df['module_count'] = 1
    if 'code_module' in df.columns:
        df['module_count'] = df.groupby('id_student')['code_module'].transform('nunique')

    # Consistency (not directly in data, set to 0.5)
    df['consistency'] = 0.5

    # Build feature matrix (9 features)
    X = []
    for _, row in df.iterrows():
        features = [
            row['num_of_prev_attempts'] / 10.0,
            row['studied_credits'] / 180.0,
            row['avg_score'] / 100.0,
            row['engagement_score'],
            row['performance_score'],
            row['risk_score'],
            row['days_active'] / 365.0,
            row['module_count'] / 10.0,
            row['consistency']
        ]
        X.append(features)

    X = np.array(X, dtype=np.float32)
    return X, y

def map_mercor_dataset(csv_path: str):
    """
    Reads the Mercor Cheating Detection train.csv.
    The dataset has anonymized columns: feature_001 .. feature_018,
    high_conf_clean, is_cheating (label).
    We use the first 10 feature columns as features.
    Returns X (10 features) and y (0/1).
    """
    df = pd.read_csv(csv_path)

    # Identify feature columns
    feature_cols = [f'feature_{i:03d}' for i in range(1, 11)]  # feature_001 to feature_010
    # Check if they exist
    for col in feature_cols:
        if col not in df.columns:
            raise KeyError(f"Expected column {col} not found in dataset")

    # Ensure label column
    if 'is_cheating' not in df.columns:
        raise KeyError("is_cheating column missing")

    # Clean label
    y = pd.to_numeric(df['is_cheating'], errors='coerce').fillna(0).clip(0, 1).astype(int).values

    # Extract features (the columns are likely already preprocessed, but we'll still apply a simple StandardScaler)
    X_raw = df[feature_cols].astype(np.float32).values

    # Optional: apply scaling (if features are not on similar scales)
    # For now, we'll just pass them as-is; they appear to be clean.
    # However, it's safe to apply a simple MinMaxScaler to ensure no extreme values.
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    X = scaler.fit_transform(X_raw)
    X = X.astype(np.float32)

    print(f"Feature columns used: {feature_cols}")
    print(f"Sample feature row: {X[0]}")
    print(f"Label distribution: cheating={y.sum()}, total={len(y)}")

    return X, y