# build_ensemble.py  (Option B – replace file with this)
import joblib, numpy as np
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier, VotingClassifier
from xgboost import XGBClassifier
from pathlib import Path

OUT = Path("backend/ml/ensemble_template.pkl")   # template, not trained

gb  = Pipeline([("imp", SimpleImputer(strategy="median")),
                ("gb",  GradientBoostingClassifier(random_state=42,
                        n_estimators=600, learning_rate=0.03, max_depth=4,
                        subsample=0.9))])

xgb = Pipeline([("imp", SimpleImputer(strategy="median")),
                ("xgb", XGBClassifier(
                    n_estimators=700, learning_rate=0.03, max_depth=4,
                    subsample=0.9, colsample_bytree=0.8,
                    eval_metric="auc", random_state=42))])

ens = VotingClassifier(
    estimators=[("gb", gb), ("xgb", xgb)],
    voting="soft",
    weights=[0.5, 0.5]
)

joblib.dump(ens, OUT)
print("Saved *untrained* ensemble template →", OUT)
