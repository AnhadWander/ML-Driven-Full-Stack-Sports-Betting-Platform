"""
Hyper-tune GradientBoostingClassifier with TimeSeriesSplit and save best model.
Outputs: backend/ml/gb_best.pkl
"""

import joblib, pandas as pd
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit
from sklearn.metrics import make_scorer, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier

DATA = "data/processed/rolling_features.csv"
OUT  = "backend/ml/gb_best.pkl"

df = pd.read_csv(DATA)
X = df.drop(columns=["GAME_ID", "GAME_DATE", "HOME_WIN"])
y = df["HOME_WIN"]

pipe = Pipeline([
    ("imp", SimpleImputer(strategy="median")),
    ("gb",  GradientBoostingClassifier(random_state=42)),
])

param_grid = {
    "gb__n_estimators":  [200, 400, 600],
    "gb__learning_rate": [0.03, 0.05, 0.1],
    "gb__max_depth":     [3, 4, 5],
    "gb__subsample":     [0.8, 0.9, 1.0],
}

cv = TimeSeriesSplit(n_splits=4)
search = GridSearchCV(
    pipe,
    param_grid,
    cv=cv,
    scoring=make_scorer(roc_auc_score),
    n_jobs=-1,
    verbose=2,
)

search.fit(X, y)
print("Best ROC-AUC:", search.best_score_)
print("Best params:", search.best_params_)

joblib.dump(search.best_estimator_, OUT)
print("Saved →", OUT)
