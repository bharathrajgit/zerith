import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from utils.kaggle_mapper import map_oulad_dataset
from models.dropout_predictor import DropoutPredictor

OULAD_CSV = 'data/kaggle/oulad_clean.csv'
if not os.path.exists(OULAD_CSV):
    print(f'File not found: {OULAD_CSV}')
    sys.exit(1)

X, y = map_oulad_dataset(OULAD_CSV)
print(f'OULAD samples: {X.shape[0]}, features: {X.shape[1]}')
print(f'Dropout rate: {y.mean():.2%}')

predictor = DropoutPredictor()
result = predictor.train(X, y)
print(f'Dropout model saved. CV accuracy: {result["accuracy"]:.4f}')