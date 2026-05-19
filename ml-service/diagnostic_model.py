import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURE_ORDER = [
    "mcq_score",
    "mcq_basic_accuracy",
    "mcq_medium_accuracy",
    "mcq_hard_accuracy",
    "mcq_avg_response_time",
    "mcq_hint_usage_rate",
    "coding_score",
    "basic_coding_score",
    "medium_coding_score",
    "hard_coding_score",
    "coding_attempt_rate",
    "test_case_pass_rate",
    "coding_time_efficiency",
    "coding_completion_rate",
    "combined_score",
    "hard_performance_ratio",
    "consistency_score",
]

LEVEL_LABELS = {
    0: "Beginner",
    1: "Intermediate",
    2: "Placement-Ready",
}

LABEL_TO_INDEX = {label: index for index, label in LEVEL_LABELS.items()}
MCQ_COMBINED_WEIGHT = 0.3
CODING_COMBINED_WEIGHT = 0.7

BASE_DIR = Path(__file__).resolve().parent
TRAINED_MODELS_DIR = BASE_DIR / "trained_models"
MODEL_PATH = TRAINED_MODELS_DIR / "diagnostic_classifier.joblib"
REPORT_PATH = TRAINED_MODELS_DIR / "diagnostic_training_report.json"
KAGGLE_DIR = BASE_DIR / "data" / "kaggle"
PYTHON_DATASET_PATH = KAGGLE_DIR / "python_learning_exam_performance.csv"
CODING_DATASET_PATH = KAGGLE_DIR / "daily_coding_habits_dataset.csv"


def clamp(value, lower=0.0, upper=1.0):
    return max(lower, min(upper, float(value)))


def clip_feature(name, value):
    if name == "mcq_avg_response_time":
        return float(np.clip(value, 0.0, 60.0))
    if name == "coding_attempt_rate":
        return float(np.clip(value, 0.0, 3.0))
    return clamp(value)


def weighted_coding_score(basic_score, medium_score, hard_score):
    return clamp(((basic_score * 2) + (medium_score * 6) + (hard_score * 15)) / 23.0)


def weighted_mcq_score(basic_score, medium_score, hard_score):
    return clamp((basic_score * 0.4) + (medium_score * 0.35) + (hard_score * 0.25))


def consistency_from_scores(mcq_score, basic_score, medium_score, hard_score):
    deviation = float(np.std([mcq_score, basic_score, medium_score, hard_score]))
    return clamp(1.0 - min(deviation / 0.5, 1.0))


def hard_ratio_from_scores(mcq_hard_accuracy, hard_coding_score):
    return clamp((hard_coding_score * 0.7) + (mcq_hard_accuracy * 0.3))


def combined_score_from_parts(mcq_score, coding_score):
    return clamp((mcq_score * MCQ_COMBINED_WEIGHT) + (coding_score * CODING_COMBINED_WEIGHT))


def canonicalize_level(raw_level):
    raw = str(raw_level or "").strip().lower()
    if raw in {"placement-ready", "placement ready", "advanced", "ready", "placement_ready"}:
        return "Placement-Ready"
    if raw == "intermediate":
        return "Intermediate"
    return "Beginner"


def label_index_for(raw_level):
    return LABEL_TO_INDEX[canonicalize_level(raw_level)]


def score_bucket_ranges(level_index):
    if level_index == 0:
        return {
            "mcq_basic": (0.20, 0.52),
            "mcq_medium": (0.10, 0.40),
            "mcq_hard": (0.00, 0.22),
            "basic_coding": (0.08, 0.40),
            "medium_coding": (0.04, 0.28),
            "hard_coding": (0.00, 0.16),
            "mcq_time": (22.0, 42.0),
            "hint_rate": (0.20, 0.72),
            "attempt_rate": (1.5, 3.0),
            "time_efficiency": (0.24, 0.58),
            "completion_rate": (0.28, 0.74),
        }
    if level_index == 1:
        return {
            "mcq_basic": (0.58, 0.86),
            "mcq_medium": (0.42, 0.74),
            "mcq_hard": (0.24, 0.58),
            "basic_coding": (0.56, 0.84),
            "medium_coding": (0.36, 0.70),
            "hard_coding": (0.14, 0.48),
            "mcq_time": (14.0, 28.0),
            "hint_rate": (0.04, 0.28),
            "attempt_rate": (1.2, 2.2),
            "time_efficiency": (0.46, 0.80),
            "completion_rate": (0.58, 0.96),
        }
    return {
        "mcq_basic": (0.82, 1.0),
        "mcq_medium": (0.72, 0.96),
        "mcq_hard": (0.56, 0.92),
        "basic_coding": (0.76, 1.0),
        "medium_coding": (0.66, 0.92),
        "hard_coding": (0.52, 1.0),
        "mcq_time": (10.0, 22.0),
        "hint_rate": (0.0, 0.14),
        "attempt_rate": (0.9, 1.8),
        "time_efficiency": (0.62, 0.96),
        "completion_rate": (0.82, 1.0),
    }


def label_target_ranges(level_index):
    if level_index == 0:
        return (0.12, 0.38), (0.04, 0.30)
    if level_index == 1:
        return (0.48, 0.68), (0.40, 0.62)
    return (0.72, 0.96), (0.66, 0.96)


def finalize_feature_row(features):
    next_row = dict(features)
    next_row["mcq_score"] = weighted_mcq_score(
        next_row["mcq_basic_accuracy"],
        next_row["mcq_medium_accuracy"],
        next_row["mcq_hard_accuracy"],
    )
    next_row["coding_score"] = weighted_coding_score(
        next_row["basic_coding_score"],
        next_row["medium_coding_score"],
        next_row["hard_coding_score"],
    )
    next_row["test_case_pass_rate"] = clamp(
        next_row.get("test_case_pass_rate", next_row["coding_score"])
    )
    next_row["combined_score"] = combined_score_from_parts(
        next_row["mcq_score"],
        next_row["coding_score"],
    )
    next_row["hard_performance_ratio"] = hard_ratio_from_scores(
        next_row["mcq_hard_accuracy"],
        next_row["hard_coding_score"],
    )
    next_row["consistency_score"] = consistency_from_scores(
        next_row["mcq_score"],
        next_row["basic_coding_score"],
        next_row["medium_coding_score"],
        next_row["hard_coding_score"],
    )
    return {
        feature_name: clip_feature(feature_name, next_row[feature_name])
        for feature_name in FEATURE_ORDER
    }


def midpoint(bounds):
    return (float(bounds[0]) + float(bounds[1])) / 2.0


def interpolate(bounds, ratio):
    lower, upper = bounds
    return float(lower + ((upper - lower) * clamp(ratio)))


def align_features_to_level(features, level_index, strength=0.18):
    ranges = score_bucket_ranges(level_index)
    aligned = dict(features)
    nudges = {
        "mcq_basic_accuracy": midpoint(ranges["mcq_basic"]),
        "mcq_medium_accuracy": midpoint(ranges["mcq_medium"]),
        "mcq_hard_accuracy": midpoint(ranges["mcq_hard"]),
        "basic_coding_score": midpoint(ranges["basic_coding"]),
        "medium_coding_score": midpoint(ranges["medium_coding"]),
        "hard_coding_score": midpoint(ranges["hard_coding"]),
        "mcq_avg_response_time": midpoint(ranges["mcq_time"]),
        "mcq_hint_usage_rate": midpoint(ranges["hint_rate"]),
        "coding_attempt_rate": midpoint(ranges["attempt_rate"]),
        "coding_time_efficiency": midpoint(ranges["time_efficiency"]),
        "coding_completion_rate": midpoint(ranges["completion_rate"]),
    }

    for feature_name, anchor in nudges.items():
        current = aligned[feature_name]
        aligned[feature_name] = current * (1.0 - strength) + anchor * strength

    return finalize_feature_row(aligned)


def sample_profile(level_index, rng):
    mcq_target, coding_target = label_target_ranges(level_index)
    ranges = score_bucket_ranges(level_index)

    for _ in range(200):
        mcq_basic = rng.uniform(*ranges["mcq_basic"])
        mcq_medium = rng.uniform(*ranges["mcq_medium"])
        mcq_hard = rng.uniform(*ranges["mcq_hard"])
        basic_coding = rng.uniform(*ranges["basic_coding"])
        medium_coding = rng.uniform(*ranges["medium_coding"])
        hard_coding = rng.uniform(*ranges["hard_coding"])

        mcq_score = weighted_mcq_score(mcq_basic, mcq_medium, mcq_hard)
        coding_score = weighted_coding_score(basic_coding, medium_coding, hard_coding)

        if mcq_target[0] <= mcq_score <= mcq_target[1] and coding_target[0] <= coding_score <= coding_target[1]:
            break

    features = finalize_feature_row(
        {
            "mcq_basic_accuracy": mcq_basic,
            "mcq_medium_accuracy": mcq_medium,
            "mcq_hard_accuracy": mcq_hard,
            "mcq_avg_response_time": rng.uniform(*ranges["mcq_time"]),
            "mcq_hint_usage_rate": rng.uniform(*ranges["hint_rate"]),
            "basic_coding_score": basic_coding,
            "medium_coding_score": medium_coding,
            "hard_coding_score": hard_coding,
            "coding_attempt_rate": rng.uniform(*ranges["attempt_rate"]),
            "test_case_pass_rate": clamp(coding_score + rng.normal(0, 0.05)),
            "coding_time_efficiency": rng.uniform(*ranges["time_efficiency"]),
            "coding_completion_rate": rng.uniform(*ranges["completion_rate"]),
        }
    )

    noisy = {}
    for feature_name in FEATURE_ORDER:
        scale = 1.35 if feature_name == "mcq_avg_response_time" else 0.08 if feature_name == "coding_attempt_rate" else 0.035
        noisy[feature_name] = clip_feature(feature_name, features[feature_name] + rng.normal(0, scale))

    return finalize_feature_row(noisy)


def generate_synthetic_diagnostic_training_data(sample_count=3600, random_state=42):
    rng = np.random.default_rng(random_state)
    label_counts = {
        0: int(sample_count * 0.40),
        1: int(sample_count * 0.35),
    }
    label_counts[2] = sample_count - label_counts[0] - label_counts[1]

    features = []
    labels = []

    for level_index, count in label_counts.items():
        for _ in range(count):
            features.append(sample_profile(level_index, rng))
            labels.append(level_index)

    labels = np.array(labels, dtype=int)
    matrix = np.array([[row[name] for name in FEATURE_ORDER] for row in features], dtype=float)

    noise_count = max(1, int(sample_count * 0.03))
    noisy_indices = rng.choice(sample_count, size=noise_count, replace=False)
    for index in noisy_indices:
        alternatives = [0, 1, 2]
        alternatives.remove(int(labels[index]))
        labels[index] = int(rng.choice(alternatives))

    return matrix, labels


def _safe_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return float(default)


def _map_python_learning_rows(csv_path):
    if not csv_path.exists():
        return []

    df = pd.read_csv(csv_path)
    if df.empty:
        return []

    defaults = {
        "previous_exam_score": 0,
        "assignment_completion_rate": 0,
        "practice_problems_solved": 0,
        "coding_challenges_completed": 0,
        "time_spent_on_coding_platform": 0,
        "debugging_sessions": 0,
        "study_hours_per_week": 0,
        "attendance_rate": 0,
        "self_reported_confidence": 3,
        "stress_level": 3,
        "sleep_hours": 7,
        "physical_activity": 1,
        "final_exam_score": 0,
        "performance_level": "Beginner",
    }
    for column, default in defaults.items():
        if column not in df.columns:
            df[column] = default

    max_practice = max(float(df["practice_problems_solved"].max() or 1), 1.0)
    max_challenges = max(float(df["coding_challenges_completed"].max() or 1), 1.0)
    max_debug = max(float(df["debugging_sessions"].max() or 1), 1.0)
    max_study = max(float(df["study_hours_per_week"].max() or 1), 1.0)
    max_activity = max(float(df["physical_activity"].max() or 1), 1.0)

    rows = []
    for _, row in df.iterrows():
        label_index = label_index_for(row.get("performance_level"))

        exam = clamp(_safe_float(row.get("previous_exam_score")) / 100.0)
        assignment = clamp(_safe_float(row.get("assignment_completion_rate")) / 100.0)
        final_exam = clamp(_safe_float(row.get("final_exam_score")) / 100.0)
        practice_ratio = clamp(_safe_float(row.get("practice_problems_solved")) / max_practice)
        challenge_ratio = clamp(_safe_float(row.get("coding_challenges_completed")) / max_challenges)
        debug_ratio = clamp(_safe_float(row.get("debugging_sessions")) / max_debug)
        study_ratio = clamp(_safe_float(row.get("study_hours_per_week")) / max_study)
        attendance = clamp(_safe_float(row.get("attendance_rate")) / 100.0)
        confidence = clamp((_safe_float(row.get("self_reported_confidence"), 3) - 1.0) / 4.0)
        low_stress = clamp(1.0 - ((_safe_float(row.get("stress_level"), 3) - 1.0) / 4.0))
        sleep = clamp(_safe_float(row.get("sleep_hours"), 7) / 9.0)
        activity = clamp(_safe_float(row.get("physical_activity"), 1) / max_activity)

        practice_effort = clamp((practice_ratio * 0.45) + (challenge_ratio * 0.35) + (study_ratio * 0.20))
        avg_response_time = float(
            np.clip(52 - (final_exam * 18) - (study_ratio * 10) + (debug_ratio * 6), 8, 55)
        )
        avg_time_score = 1.0 - clamp((avg_response_time - 8.0) / 52.0)

        features = finalize_feature_row(
            {
                "mcq_basic_accuracy": clamp((exam * 0.58) + (attendance * 0.22) + (sleep * 0.20)),
                "mcq_medium_accuracy": clamp((assignment * 0.48) + (exam * 0.22) + (confidence * 0.30)),
                "mcq_hard_accuracy": clamp((final_exam * 0.50) + (practice_ratio * 0.30) + (confidence * 0.20)),
                "mcq_avg_response_time": avg_response_time,
                "mcq_hint_usage_rate": clamp((debug_ratio * 0.65) + ((1 - confidence) * 0.25) + ((1 - exam) * 0.10)),
                "basic_coding_score": clamp((practice_ratio * 0.45) + (assignment * 0.20) + (attendance * 0.15) + (confidence * 0.20)),
                "medium_coding_score": clamp((challenge_ratio * 0.45) + (exam * 0.15) + (final_exam * 0.20) + (confidence * 0.20)),
                "hard_coding_score": clamp((final_exam * 0.35) + (challenge_ratio * 0.25) + (low_stress * 0.20) + (sleep * 0.10) + (confidence * 0.10)),
                "coding_attempt_rate": float(np.clip(1.0 + (practice_effort * 1.2) + (debug_ratio * 0.8), 0, 3)),
                "test_case_pass_rate": clamp((practice_ratio * 0.22) + (challenge_ratio * 0.38) + (final_exam * 0.40)),
                "coding_time_efficiency": clamp((confidence * 0.25) + (low_stress * 0.20) + (sleep * 0.15) + (attendance * 0.15) + (activity * 0.10) + (avg_time_score * 0.15)),
                "coding_completion_rate": clamp((assignment * 0.40) + (challenge_ratio * 0.35) + (study_ratio * 0.25)),
            }
        )
        rows.append((align_features_to_level(features, label_index), label_index, "python_learning"))

    return rows


def _map_daily_coding_rows(csv_path):
    if not csv_path.exists():
        return []

    df = pd.read_csv(csv_path)
    if df.empty:
        return []

    defaults = {
        "daily_coding_time_minutes": 0,
        "problems_solved": 0,
        "difficulty_level": "Beginner",
        "streak_days": 0,
    }
    for column, default in defaults.items():
        if column not in df.columns:
            df[column] = default

    max_time = max(float(df["daily_coding_time_minutes"].max() or 1), 1.0)
    max_problems = max(float(df["problems_solved"].max() or 1), 1.0)
    max_streak = max(float(df["streak_days"].max() or 1), 1.0)

    rows = []
    for _, row in df.iterrows():
        label_index = label_index_for(row.get("difficulty_level"))
        ranges = score_bucket_ranges(label_index)

        time_commitment = clamp(_safe_float(row.get("daily_coding_time_minutes")) / max_time)
        activity = clamp(_safe_float(row.get("problems_solved")) / max_problems)
        consistency = clamp(_safe_float(row.get("streak_days")) / max_streak)
        focus = clamp((activity * 0.52) + (consistency * 0.30) + (time_commitment * 0.18))

        features = finalize_feature_row(
            {
                "mcq_basic_accuracy": interpolate(ranges["mcq_basic"], (activity * 0.55) + (consistency * 0.45)),
                "mcq_medium_accuracy": interpolate(ranges["mcq_medium"], (activity * 0.50) + (consistency * 0.35) + (time_commitment * 0.15)),
                "mcq_hard_accuracy": interpolate(ranges["mcq_hard"], (activity * 0.35) + (consistency * 0.45) + (time_commitment * 0.20)),
                "mcq_avg_response_time": interpolate(ranges["mcq_time"], 1.0 - focus),
                "mcq_hint_usage_rate": interpolate(ranges["hint_rate"], 1.0 - ((activity * 0.60) + (consistency * 0.40))),
                "basic_coding_score": interpolate(ranges["basic_coding"], (activity * 0.70) + (time_commitment * 0.30)),
                "medium_coding_score": interpolate(ranges["medium_coding"], (activity * 0.55) + (consistency * 0.25) + (time_commitment * 0.20)),
                "hard_coding_score": interpolate(ranges["hard_coding"], (activity * 0.40) + (consistency * 0.40) + (time_commitment * 0.20)),
                "coding_attempt_rate": interpolate(ranges["attempt_rate"], (time_commitment * 0.65) + (activity * 0.35)),
                "test_case_pass_rate": clamp((focus * 0.25) + (activity * 0.35) + (consistency * 0.20) + (time_commitment * 0.20)),
                "coding_time_efficiency": interpolate(ranges["time_efficiency"], (consistency * 0.55) + (activity * 0.25) + (time_commitment * 0.20)),
                "coding_completion_rate": interpolate(ranges["completion_rate"], (activity * 0.48) + (consistency * 0.34) + (time_commitment * 0.18)),
            }
        )
        rows.append((align_features_to_level(features, label_index), label_index, "daily_coding"))

    return rows


def _augment_rows(rows, copies=2, random_state=42):
    rng = np.random.default_rng(random_state)
    augmented = []

    for features, label_index, source_name in rows:
        augmented.append((features, label_index, source_name))

        for _ in range(max(0, copies)):
            noisy = {}
            for feature_name in FEATURE_ORDER:
                scale = 1.0 if feature_name == "mcq_avg_response_time" else 0.06 if feature_name == "coding_attempt_rate" else 0.025
                noisy[feature_name] = clip_feature(
                    feature_name,
                    features[feature_name] + rng.normal(0, scale),
                )
            augmented.append((finalize_feature_row(noisy), label_index, source_name))

    return augmented


def load_kaggle_diagnostic_rows(random_state=42):
    rows = []
    rows.extend(_map_python_learning_rows(PYTHON_DATASET_PATH))
    rows.extend(_map_daily_coding_rows(CODING_DATASET_PATH))
    return _augment_rows(rows, copies=2, random_state=random_state) if rows else []


def build_diagnostic_training_dataset(sample_count=3600, include_kaggle=True, random_state=42):
    synthetic_X, synthetic_y = generate_synthetic_diagnostic_training_data(
        sample_count=sample_count,
        random_state=random_state,
    )

    training_sources = {"synthetic": int(len(synthetic_y))}
    X = synthetic_X
    y = synthetic_y

    if include_kaggle:
        kaggle_rows = load_kaggle_diagnostic_rows(random_state=random_state + 17)
        if kaggle_rows:
            kaggle_X = np.array(
                [[row[name] for name in FEATURE_ORDER] for row, _, _ in kaggle_rows],
                dtype=float,
            )
            kaggle_y = np.array([label for _, label, _ in kaggle_rows], dtype=int)
            X = np.vstack([X, kaggle_X])
            y = np.concatenate([y, kaggle_y])

            source_counts = Counter(source_name for _, _, source_name in kaggle_rows)
            training_sources.update({key: int(value) for key, value in source_counts.items()})

    rng = np.random.default_rng(random_state + 31)
    permutation = rng.permutation(len(y))
    X = X[permutation]
    y = y[permutation]

    return X, y, {
        "training_sources": training_sources,
        "kaggle_sample_count": int(sum(count for key, count in training_sources.items() if key != "synthetic")),
    }


def build_diagnostic_model_bundle(sample_count=3600, include_kaggle=True, random_state=42):
    X, y, metadata = build_diagnostic_training_dataset(
        sample_count=sample_count,
        include_kaggle=include_kaggle,
        random_state=random_state,
    )

    random_forest = RandomForestClassifier(
        n_estimators=240,
        max_depth=14,
        min_samples_leaf=2,
        class_weight="balanced_subsample",
        random_state=random_state,
        n_jobs=-1,
    )
    gradient_boosting = GradientBoostingClassifier(
        n_estimators=220,
        learning_rate=0.08,
        random_state=random_state,
    )
    logistic_regression = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "model",
                LogisticRegression(
                    C=1.2,
                    max_iter=2500,
                    random_state=random_state,
                ),
            ),
        ]
    )

    ensemble = VotingClassifier(
        estimators=[
            ("rf", random_forest),
            ("gb", gradient_boosting),
            ("lr", logistic_regression),
        ],
        voting="soft",
        weights=[3, 2, 1],
    )

    cross_validator = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_scores = cross_val_score(ensemble, X, y, cv=cross_validator, scoring="accuracy")
    ensemble.fit(X, y)

    return {
        "model": ensemble,
        "cv_mean_accuracy": float(np.mean(cv_scores)),
        "cv_std_accuracy": float(np.std(cv_scores)),
        "sample_count": int(len(y)),
        "class_distribution": {LEVEL_LABELS[idx]: int(count) for idx, count in Counter(y).items()},
        "training_sources": metadata["training_sources"],
        "kaggle_sample_count": metadata["kaggle_sample_count"],
        "model_source": "runtime",
        "n_features": len(FEATURE_ORDER),
    }


def save_diagnostic_model_bundle(bundle):
    TRAINED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle["model"], MODEL_PATH)

    report = {
        "model": "VotingClassifier (RF + GB + LR)",
        "feature_names": FEATURE_ORDER,
        "n_features": int(bundle.get("n_features", len(FEATURE_ORDER))),
        "sample_count": int(bundle.get("sample_count", 0)),
        "class_distribution": bundle.get("class_distribution", {}),
        "cv_mean_accuracy": float(bundle.get("cv_mean_accuracy", 0)),
        "cv_std_accuracy": float(bundle.get("cv_std_accuracy", 0)),
        "training_sources": bundle.get("training_sources", {}),
        "kaggle_sample_count": int(bundle.get("kaggle_sample_count", 0)),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "model_path": str(MODEL_PATH),
    }

    with REPORT_PATH.open("w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)

    return report


def load_diagnostic_model_bundle():
    if not MODEL_PATH.exists() or not REPORT_PATH.exists():
        return None

    try:
        model = joblib.load(MODEL_PATH)
        with REPORT_PATH.open("r", encoding="utf-8") as handle:
            report = json.load(handle)
        return {
            "model": model,
            "cv_mean_accuracy": float(report.get("cv_mean_accuracy", 0)),
            "cv_std_accuracy": float(report.get("cv_std_accuracy", 0)),
            "sample_count": int(report.get("sample_count", 0)),
            "class_distribution": report.get("class_distribution", {}),
            "training_sources": report.get("training_sources", {}),
            "kaggle_sample_count": int(report.get("kaggle_sample_count", 0)),
            "model_source": "disk",
            "n_features": int(report.get("n_features", len(FEATURE_ORDER))),
        }
    except Exception:
        return None


def build_confidence_explanation(features, probabilities, level_label=None):
    if isinstance(probabilities, dict):
        probability_vector = np.array(
            [float(probabilities.get(LEVEL_LABELS[index], 0)) for index in range(len(LEVEL_LABELS))],
            dtype=float,
        )
    else:
        probability_vector = np.asarray(probabilities, dtype=float).flatten()

    if probability_vector.size == 0:
        return ""

    level_index = int(np.argmax(probability_vector))
    resolved_level = level_label or LEVEL_LABELS.get(level_index, "Beginner")
    top_probability = float(np.max(probability_vector))
    sorted_probabilities = np.sort(probability_vector)[::-1]
    runner_up = float(sorted_probabilities[1]) if sorted_probabilities.size > 1 else 0.0
    margin = top_probability - runner_up

    combined_score = float(features.get("combined_score", 0))
    mcq_percent = int(round(float(features.get("mcq_score", 0)) * 100))
    coding_percent = int(round(float(features.get("coding_score", 0)) * 100))

    boundaries = [
        (0.40, "Beginner / Intermediate"),
        (0.70, "Intermediate / Placement-Ready"),
    ]
    _, closest_boundary = min(
        ((abs(combined_score - boundary), label) for boundary, label in boundaries),
        key=lambda item: item[0],
    )

    if top_probability >= 0.78 and margin >= 0.22:
        return (
            f"High confidence: the 17 diagnostic features separate this profile clearly. "
            f"MCQ is {mcq_percent}% and coding is {coding_percent}%."
        )

    if top_probability >= 0.60 and margin >= 0.12:
        return (
            f"Moderate confidence: most of the 17 diagnostic features align with {resolved_level}. "
            f"MCQ is {mcq_percent}% and coding is {coding_percent}%."
        )

    return (
        f"Lower confidence: MCQ is {mcq_percent}% and coding is {coding_percent}%, "
        f"which keeps this profile close to the {closest_boundary} boundary."
    )
