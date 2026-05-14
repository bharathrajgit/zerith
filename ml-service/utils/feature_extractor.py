"""
feature_extractor.py
Upgraded to 13 features including error patterns.
IMPORTANT: Feature count must match training data.
"""

import numpy as np


def extract_features(performance_data):
    """
    Extract 13 normalized features from performance data.

    Input keys:
        round1_accuracy       (0-100)
        round2_accuracy       (0-100)
        round3_accuracy       (0-100)
        coding_accuracy       (0-100)
        avg_response_time     (seconds, 0-120)
        hint_usage_rate       (0-1)
        attempt_count         (1-20)
        streak_day            (0-365)
        skip_attempts         (0-10)
        topics_studied_count  (0-11)
        conceptual_error_rate (0-1) ← NEW
        application_error_rate(0-1) ← NEW
        reasoning_error_rate  (0-1) ← NEW

    Returns: numpy array shape (13,)
    """
    max_vals = {
        'round1_accuracy':       100.0,
        'round2_accuracy':       100.0,
        'round3_accuracy':       100.0,
        'coding_accuracy':       100.0,
        'avg_response_time':     120.0,
        'hint_usage_rate':       1.0,
        'attempt_count':         20.0,
        'streak_day':            365.0,
        'skip_attempts':         10.0,
        'topics_studied_count':  11.0,
        'conceptual_error_rate': 1.0,
        'application_error_rate':1.0,
        'reasoning_error_rate':  1.0,
    }

    feature_order = [
        'round1_accuracy', 'round2_accuracy',
        'round3_accuracy', 'coding_accuracy',
        'avg_response_time', 'hint_usage_rate',
        'attempt_count', 'streak_day',
        'skip_attempts', 'topics_studied_count',
        'conceptual_error_rate',
        'application_error_rate',
        'reasoning_error_rate',
    ]

    features = []
    for key in feature_order:
        val = float(performance_data.get(key, 0))
        m = max_vals[key]
        norm_val = float(np.clip(val / m, 0.0, 1.0))
        features.append(norm_val)

    return np.array(features, dtype=np.float32)


def extract_diagnostic_features(diagnostic_data):
    """
    Extract features from diagnostic test.
    Returns numpy array shape (13,) for consistency.
    Maps diagnostic scores to performance features.
    """
    total_score = diagnostic_data.get('total_score', 0)
    per_topic = diagnostic_data.get('per_topic_scores', {})
    avg_time = diagnostic_data.get(
        'avg_time_per_question', 60)

    # Derive error rates from topic scores
    # Low score on early topics = conceptual gaps
    early_topics = ['arrays', 'strings', 'searching']
    mid_topics = ['sorting', 'recursion', 'linked_lists']
    hard_topics = ['trees', 'graphs', 'dp']

    def avg_score(topics_list):
        scores = [per_topic.get(t, 0) for t in topics_list]
        return np.mean(scores) if scores else 0

    early_avg = avg_score(early_topics)
    mid_avg = avg_score(mid_topics)
    hard_avg = avg_score(hard_topics)

    # Map diagnostic to performance features
    performance_data = {
        'round1_accuracy':        early_avg,
        'round2_accuracy':        mid_avg,
        'round3_accuracy':        hard_avg,
        'coding_accuracy':        total_score * 0.8,
        'avg_response_time':      avg_time,
        'hint_usage_rate':        0.5,
        'attempt_count':          1,
        'streak_day':             0,
        'skip_attempts':          0,
        'topics_studied_count':   len(per_topic),
        'conceptual_error_rate':  1 - (early_avg / 100),
        'application_error_rate': 1 - (mid_avg / 100),
        'reasoning_error_rate':   1 - (hard_avg / 100),
    }

    return extract_features(performance_data)


def calculate_error_rates(assessment_history):
    """
    Calculate real error rates from actual
    assessment history stored in MongoDB.

    Call this when real data is available.
    assessment_history: list of assessment documents

    Returns dict with error rates for
    use in extract_features()
    """
    if not assessment_history:
        return {
            'conceptual_error_rate':  0.5,
            'application_error_rate': 0.5,
            'reasoning_error_rate':   0.5,
        }

    basic_wrong = 0
    basic_total = 0
    medium_wrong = 0
    medium_total = 0
    hard_wrong = 0
    hard_total = 0

    for assessment in assessment_history:
        round_type = assessment.get('round', '')
        correct = assessment.get('correctAnswers', 0)
        total = assessment.get('totalQuestions', 0)
        wrong = total - correct

        if round_type == 'Basic':
            basic_wrong += wrong
            basic_total += total
        elif round_type == 'Medium':
            medium_wrong += wrong
            medium_total += total
        elif round_type == 'Hard':
            hard_wrong += wrong
            hard_total += total

    return {
        'conceptual_error_rate': (
            basic_wrong / basic_total
            if basic_total > 0 else 0.5
        ),
        'application_error_rate': (
            medium_wrong / medium_total
            if medium_total > 0 else 0.5
        ),
        'reasoning_error_rate': (
            hard_wrong / hard_total
            if hard_total > 0 else 0.5
        ),
    }