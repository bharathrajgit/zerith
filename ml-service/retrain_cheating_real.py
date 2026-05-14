import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from utils.kaggle_mapper import map_mercor_dataset
from models.cheating_detector import CheatingDetector

MERCOR_CSV = 'data/kaggle/mercor_train.csv'

if not os.path.exists(MERCOR_CSV):
    print(f'File not found: {MERCOR_CSV}')
    print('Please download the Mercor cheating detection dataset and place it there.')
    sys.exit(1)

X, y = map_mercor_dataset(MERCOR_CSV)
print(f'Mercor samples: {X.shape[0]}, features: {X.shape[1]}')
print(f'Cheating rate: {y.mean():.2%}')

detector = CheatingDetector()
result = detector.train(X, y)

print(f'Cheating model trained on real data.')
print(f'CV Accuracy: {result["accuracy"]:.4f}')
print(f'Model saved to trained_models/cheating_detector.pkl')