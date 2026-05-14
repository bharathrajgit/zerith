"""
data_preprocessor.py
Generates REALISTIC synthetic training data with:
- Natural noise and class overlap (like real students)
- Behavioral inconsistencies
- Edge cases
- Error pattern simulation
"""

import numpy as np
import pandas as pd
import os


# ─────────────────────────────────────────────────────────
# REALISTIC DATA GENERATOR
# ─────────────────────────────────────────────────────────

def generate_training_data(n_samples=2000):
    """
    Generate realistic student performance data.
    Key improvements over basic synthetic data:
    1. Class overlap — some beginners score high on Round1
    2. Behavioral noise — inconsistent performance
    3. Edge cases — streaks don't always match skill
    4. Error patterns as features
    """
    np.random.seed(42)
    X = []
    y = []

    # Distribution: 40% Beginner, 40% Intermediate,
    #               20% Placement-Ready
    # (matches real distribution in institutions)
    per_class = {
        'Beginner': int(n_samples * 0.40),
        'Intermediate': int(n_samples * 0.40),
        'Placement-Ready': n_samples - int(n_samples * 0.40)
                           - int(n_samples * 0.40)
    }

    for level, count in per_class.items():
        for i in range(count):

            # ── BEGINNER ──────────────────────────────────
            if level == 'Beginner':
                # Core accuracy: low, but with noise
                r1 = np.random.normal(38, 12)
                r2 = np.random.normal(30, 10)
                r3 = np.random.normal(22, 8)
                coding = np.random.normal(25, 12)

                # Behavioral features
                resp_time = np.random.normal(95, 18)
                hints = np.random.normal(0.72, 0.15)
                attempts = np.random.normal(12, 4)
                streak = np.random.normal(4, 3)
                skips = np.random.normal(6, 2)
                topics = np.random.normal(2, 1)

                # Error patterns (how many concept errors)
                conceptual_errors = np.random.normal(0.75, 0.15)
                application_errors = np.random.normal(0.65, 0.15)
                reasoning_errors = np.random.normal(0.80, 0.12)

                # REALISTIC EDGE CASES for beginners
                # Some beginners get lucky on Round1
                if np.random.random() < 0.15:
                    r1 = np.random.uniform(55, 70)

                # Some beginners have high streaks
                # (motivated but still struggling)
                if np.random.random() < 0.10:
                    streak = np.random.uniform(20, 40)

            # ── INTERMEDIATE ──────────────────────────────
            elif level == 'Intermediate':
                r1 = np.random.normal(70, 10)
                r2 = np.random.normal(62, 10)
                r3 = np.random.normal(52, 12)
                coding = np.random.normal(58, 12)

                resp_time = np.random.normal(48, 12)
                hints = np.random.normal(0.38, 0.15)
                attempts = np.random.normal(5, 2)
                streak = np.random.normal(18, 8)
                skips = np.random.normal(3, 1.5)
                topics = np.random.normal(5, 1.5)

                conceptual_errors = np.random.normal(0.30, 0.12)
                application_errors = np.random.normal(0.45, 0.15)
                reasoning_errors = np.random.normal(0.60, 0.15)

                # EDGE CASES for intermediate
                # Some intermediate students score low on R3
                # (strong basics, weak deep reasoning)
                if np.random.random() < 0.20:
                    r3 = np.random.uniform(25, 45)

                # Some intermediate have low streaks
                # (inconsistent practice)
                if np.random.random() < 0.15:
                    streak = np.random.uniform(2, 8)

            # ── PLACEMENT-READY ───────────────────────────
            else:
                r1 = np.random.normal(90, 6)
                r2 = np.random.normal(85, 7)
                r3 = np.random.normal(78, 8)
                coding = np.random.normal(85, 8)

                resp_time = np.random.normal(22, 7)
                hints = np.random.normal(0.08, 0.06)
                attempts = np.random.normal(1.5, 0.5)
                streak = np.random.normal(48, 18)
                skips = np.random.normal(0.5, 0.5)
                topics = np.random.normal(9.5, 1)

                conceptual_errors = np.random.normal(0.08, 0.06)
                application_errors = np.random.normal(0.15, 0.08)
                reasoning_errors = np.random.normal(0.22, 0.10)

                # EDGE CASES for placement-ready
                # Some placement-ready students have
                # moderate streaks (already confident)
                if np.random.random() < 0.10:
                    streak = np.random.uniform(10, 25)

            # ── CLAMP ALL VALUES TO VALID RANGES ──────────
            r1 = np.clip(r1, 0, 100)
            r2 = np.clip(r2, 0, 100)
            r3 = np.clip(r3, 0, 100)
            coding = np.clip(coding, 0, 100)
            resp_time = np.clip(resp_time, 5, 120)
            hints = np.clip(hints, 0, 1)
            attempts = np.clip(attempts, 1, 20)
            streak = np.clip(streak, 0, 365)
            skips = np.clip(skips, 0, 10)
            topics = np.clip(topics, 1, 11)
            conceptual_errors = np.clip(
                conceptual_errors, 0, 1)
            application_errors = np.clip(
                application_errors, 0, 1)
            reasoning_errors = np.clip(
                reasoning_errors, 0, 1)

            # ── NORMALIZE (match feature_extractor) ───────
            features = [
                r1 / 100.0,
                r2 / 100.0,
                r3 / 100.0,
                coding / 100.0,
                resp_time / 120.0,
                hints,
                attempts / 20.0,
                streak / 365.0,
                skips / 10.0,
                topics / 11.0,
                conceptual_errors,     # new feature
                application_errors,    # new feature
                reasoning_errors       # new feature
            ]

            X.append(features)
            y.append(level)

    X = np.array(X, dtype=np.float32)
    y = np.array(y)

    # Shuffle data
    indices = np.random.permutation(len(X))
    return X[indices], y[indices]


def save_training_data(X, y, filepath):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    columns = [
        'round1_accuracy', 'round2_accuracy',
        'round3_accuracy', 'coding_accuracy',
        'avg_response_time', 'hint_usage_rate',
        'attempt_count', 'streak_day',
        'skip_attempts', 'topics_studied_count',
        'conceptual_error_rate',
        'application_error_rate',
        'reasoning_error_rate'
    ]
    df = pd.DataFrame(X, columns=columns)
    df['label'] = y
    df.to_csv(filepath, index=False)
    print(f'Training data saved → {filepath}')
    print(f'Samples: {len(df)} | '
          f'Classes: {df["label"].value_counts().to_dict()}')


def load_training_data(filepath):
    df = pd.read_csv(filepath)
    if 'label' not in df.columns:
        raise ValueError("CSV missing 'label' column")
    y = df['label'].values
    X = df.drop(columns=['label']).values
    return X.astype(np.float32), y