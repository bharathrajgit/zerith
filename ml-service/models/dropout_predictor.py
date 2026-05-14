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
        return {'dropout_probability': float(proba), 'at_risk': bool(proba >= 0.5)}

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.is_trained = True