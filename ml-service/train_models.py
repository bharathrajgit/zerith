"""
train_models.py
FINAL VERSION
Run once before starting server:
    python train_models.py

Place in: ml-service/train_models.py
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(__file__))

from models.skill_classifier import SkillClassifier
from utils.data_preprocessor import (
    generate_training_data,
    save_training_data
)


def main():
    print('\n' + '='*55)
    print('  DSA PLATFORM — ML TRAINING PIPELINE')
    print('='*55)

    # ── Step 1: Generate data ──────────────────────────
    print('\n[1/4] Generating realistic training data...')
    X, y = generate_training_data(n_samples=2000)

    from collections import Counter
    dist = Counter(y.tolist())

    print(f'  Total samples : {len(X)}')
    print(f'  Features      : {X.shape[1]}')
    print(f'  Distribution  : {dict(dist)}')

    # ── Step 2: Save CSV ───────────────────────────────
    print('\n[2/4] Saving training data to CSV...')
    save_training_data(X, y, 'data/training_data.csv')

    # ── Step 3: Train model ────────────────────────────
    print('\n[3/4] Training ensemble classifier...')
    clf    = SkillClassifier()
    result = clf.train(X, y)

    # ── Step 4: Save report ────────────────────────────
    print('\n[4/4] Saving training report...')
    os.makedirs('trained_models', exist_ok=True)

    report = {
        'model':                  'Ensemble (RF+GB+LR)',
        'voting':                 'soft',
        'weights':                [3, 2, 1],
        'n_samples':              len(X),
        'n_features':             int(X.shape[1]),
        'class_distribution':     dict(dist),
        'cv_mean_accuracy':       result['cv_mean_accuracy'],
        'cv_std':                 result['cv_std'],
        'cv_scores':              result['cv_scores'],
        'test_accuracy':          result['test_accuracy'],
        'classes':                result['classes'],
        'confusion_matrix':       result['confusion_matrix'],
        'classification_report':  result[
            'classification_report'
        ],
        'feature_importance':     clf.get_feature_importance(),
    }

    report_path = 'trained_models/training_report.json'
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    # ── Final summary ──────────────────────────────────
    print('\n' + '='*55)
    print('  TRAINING COMPLETE')
    print('='*55)
    cv_pct   = result['cv_mean_accuracy'] * 100
    cv_std   = result['cv_std'] * 100
    test_pct = result['test_accuracy'] * 100

    print(f'  CV Accuracy   : {cv_pct:.1f}% (±{cv_std:.1f}%)')
    print(f'  Test Accuracy : {test_pct:.1f}%')

    print(f'\n  Top 5 Predictive Features:')
    importance = clf.get_feature_importance()
    top5       = list(importance.items())[:5]
    for rank, (feat, score) in enumerate(top5, 1):
        bar = '█' * int(score * 50)
        print(f'  {rank}. {feat:<30} {score:.4f}  {bar}')

    print(f'\n  Report → {report_path}')
    print(f'  Models → trained_models/')
    print('\n  Ready to start server: python app.py')
    print('='*55 + '\n')


if __name__ == '__main__':
    main()