from pathlib import Path
import joblib
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier, VotingClassifier
from xgboost import XGBClassifier

OUT = Path("backend/ml/ensemble_template.pkl")

gb = Pipeline([
    ("imp", SimpleImputer(strategy="median")),
    ("gb",  GradientBoostingClassifier(
        random_state=42, n_estimators=600,
        learning_rate=0.03, max_depth=4, subsample=0.9)) 
])

xgb = Pipeline([
    ("imp", SimpleImputer(strategy="median")),
    ("xgb", XGBClassifier(
        n_estimators=700, learning_rate=0.03, max_depth=4,
        subsample=0.9, colsample_bytree=0.8,
        eval_metric="auc", random_state=42))
])

ens = VotingClassifier(
    estimators=[("gb", gb), ("xgb", xgb)],
    voting="soft",
    weights=[0.5, 0.5]
)

OUT.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(ens, OUT)
print("Saved un-trained ensemble template →", OUT)
