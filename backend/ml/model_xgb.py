"""
Train XGBoost on all data with sensible params and save as xgb_model.pkl
"""

import joblib, pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import TimeSeriesSplit

DATA = "data/processed/rolling_features.csv"
OUT  = "backend/ml/xgb_model.pkl"

df = pd.read_csv(DATA)
X = df.drop(columns=["GAME_ID", "GAME_DATE", "HOME_WIN"])
y = df["HOME_WIN"]

pipe = Pipeline([
    ("imp", SimpleImputer(strategy="median")),
    ("xgb", XGBClassifier(
        n_estimators=700,
        learning_rate=0.03,
        max_depth=4,
        subsample=0.9,
        colsample_bytree=0.8,
        eval_metric="auc",
        random_state=42,
        n_jobs=-1,
    )),
])

tscv = TimeSeriesSplit(n_splits=4)
scores = []
for train, test in tscv.split(X):
    pipe.fit(X.iloc[train], y.iloc[train])
    proba = pipe.predict_proba(X.iloc[test])[:,1]
    scores.append(roc_auc_score(y.iloc[test], proba))
print("XGB 4-fold ROC-AUC:", sum(scores)/len(scores))

pipe.fit(X, y)
joblib.dump(pipe, OUT)
print("Saved →", OUT)
