import numpy as np, joblib
from pathlib import Path
from sklearn.base import BaseEstimator, ClassifierMixin

class ProbAvgEnsemble(BaseEstimator, ClassifierMixin):
    """
    Average the class-probability outputs of several pre-trained models.
    """
    def __init__(self, model_paths, weights=None):
        self.model_paths = [Path(p) for p in model_paths]
        self.weights     = np.array(
            weights if weights is not None
            else [1/len(model_paths)]*len(model_paths)
        )
        self.models      = [joblib.load(p) for p in self.model_paths]

    def fit(self, X, y=None):
        return self

    def predict_proba(self, X):
        proba = np.zeros((X.shape[0], 2))
        for w, m in zip(self.weights, self.models):
            proba += w * m.predict_proba(X)
        return proba

    def predict(self, X):
        return (self.predict_proba(X)[:, 1] >= 0.5).astype(int)
