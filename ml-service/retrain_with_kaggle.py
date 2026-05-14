# ml-service/retrain_with_kaggle.py
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import numpy as np
from utils.data_preprocessor import generate_training_data
from utils.kaggle_mapper import (
    map_python_learning_dataset,
    map_daily_coding_dataset
)
from models.skill_classifier import SkillClassifier

KAGGLE_PYTHON = 'data/kaggle/python_learning_exam_performance.csv'
KAGGLE_CODING = 'data/kaggle/daily_coding_habits_dataset.csv'

X_real, y_real = np.empty((0, 13), dtype=np.float32), np.array([])

# Load each dataset if present
for path, loader in [(KAGGLE_PYTHON, map_python_learning_dataset),
                      (KAGGLE_CODING, map_daily_coding_dataset)]:
    if os.path.exists(path):
        X_temp, y_temp = loader(path)
        X_real = np.vstack([X_real, X_temp]) if X_real.size else X_temp
        y_real = np.concatenate([y_real, y_temp])
        print(f'✅ Loaded {len(X_temp)} samples from {os.path.basename(path)}')
    else:
        print(f'⚠️  Not found: {path}')

if X_real.size == 0:
    print('No Kaggle datasets found. Training on synthetic data only.')

N_SYNTH = 2000
print(f'Generating {N_SYNTH} synthetic samples …')
X_syn, y_syn = generate_training_data(N_SYNTH)

X_all = np.vstack([X_syn, X_real]) if X_real.size else X_syn
y_all = np.concatenate([y_syn, y_real]) if y_real.size else y_syn

print(f'Total training samples: {len(X_all)}')
print(f'Label distribution: {dict(zip(*np.unique(y_all, return_counts=True)))}')

clf = SkillClassifier()
result = clf.train(X_all, y_all)

print('\n┌──────────────────────────────────────┐')
print(f'│ CV Accuracy : {result["cv_mean_accuracy"]*100:.1f}% '
      f'(±{result["cv_std"]*100:.1f}%) │')
print(f'│ Test Accuracy : {result["test_accuracy"]*100:.1f}%          │')
print('└──────────────────────────────────────┘')