import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from utils.kaggle_mapper import map_python_learning_dataset

# We'll test with a dummy CSV that has the required columns
csv_path = 'data/kaggle/python_learning_exam_performance.csv'

# If the real dataset isn't present, create a dummy one
if not os.path.exists(csv_path):
    print("No Kaggle dataset found. Creating a dummy one for testing...")
    import pandas as pd
    import numpy as np
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    n = 10
    df = pd.DataFrame({
        'previous_exam_score': np.random.uniform(20, 100, n),
        'assignment_completion_rate': np.random.uniform(20, 100, n),
        'practice_problems_solved': np.random.randint(5, 50, n),
        'coding_challenges_completed': np.random.randint(0, 20, n),
        'time_spent_on_coding_platform': np.random.uniform(10, 120, n),
        'debugging_sessions': np.random.randint(0, 10, n),
        'study_hours_per_week': np.random.uniform(1, 20, n),
        'attendance_rate': np.random.uniform(50, 100, n),
        'self_reported_confidence': np.random.randint(1, 5, n),
        'stress_level': np.random.randint(1, 5, n),
        'sleep_hours': np.random.uniform(4, 9, n),
        'physical_activity': np.random.randint(0, 3, n),
        'final_exam_score': np.random.uniform(30, 100, n),
        'performance_level': np.random.choice(['Beginner', 'Intermediate', 'Advanced'], n)
    })
    df.to_csv(csv_path, index=False)
    print("Dummy dataset created.")

print(f"Reading {csv_path} ...")
X, y = map_python_learning_dataset(csv_path)
print(f"Features shape: {X.shape}")
print(f"Labels shape: {y.shape}")
print(f"First 3 features: {X[0][:3]}")
print(f"First label: {y[0]}")