"""
backend/ml/evaluate_model.py
──────────────────────────────────────────────────────────────
Leakage-free, time-aware evaluation for NBA home-win prediction.

Public functions
────────────────
• evaluate_single_game()
• evaluate_future_block(block_size=30)
• evaluate_multiple_blocks(n_runs=30, block_size=30)
• save_full_history_model()
"""

import random
from pathlib import Path
from statistics import mean, stdev

import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline

# ──────────────────────────────────────────────
FEAT_DATA = Path("data/processed/rolling_features.csv")
MODEL_PATH = Path("backend/ml/rolling_model.pkl")
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
# ──────────────────────────────────────────────


# ╔══════════════════════════════════════════╗
# ║  Data & model helpers                   ║
# ╚══════════════════════════════════════════╝
def _load_data() -> pd.DataFrame:
    if not FEAT_DATA.exists():
        raise FileNotFoundError(
            f"{FEAT_DATA} not found – run scripts/build_rolling_features.py first."
        )
    return (
        pd.read_csv(FEAT_DATA)
        .sort_values("GAME_DATE")
        .reset_index(drop=True)
    )


def _make_pipeline() -> Pipeline:
    """Returns Imputer → GradientBoosting pipeline."""
    return Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("model", GradientBoostingClassifier(random_state=RANDOM_SEED)),
        ]
    )


def _train_pipeline(train_df: pd.DataFrame) -> Pipeline:
    X = train_df.drop(columns=["GAME_ID", "GAME_DATE", "HOME_WIN"])
    y = train_df["HOME_WIN"]

    n_missing = int(X.isna().sum().sum())
    if n_missing:
        print(f"↪ Imputing {n_missing} missing values in training set")

    pipe = _make_pipeline()
    pipe.fit(X, y)
    return pipe


def _metric_dict(y_true, y_pred, y_prob) -> dict:
    """Compute metrics, handling single-class ROC/AUC."""
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, zero_division=0),
        "recall": recall_score(y_true, y_pred, zero_division=0),
        "f1": f1_score(y_true, y_pred, zero_division=0),
        "roc_auc": None,
    }
    if len(set(y_true)) > 1:
        metrics["roc_auc"] = roc_auc_score(y_true, y_prob)
    return metrics


def _print_metrics(metrics: dict):
    print(f"Accuracy : {metrics['accuracy']:.3f}")
    print(f"Precision: {metrics['precision']:.3f}")
    print(f"Recall   : {metrics['recall']:.3f}")
    print(f"F1 Score : {metrics['f1']:.3f}")
    roc_msg = (
        f"{metrics['roc_auc']:.3f}"
        if metrics["roc_auc"] is not None
        else "n/a (one class only)"
    )
    print(f"ROC-AUC  : {roc_msg}")


# ╔══════════════════════════════════════════╗
# ║  Evaluation modes                       ║
# ╚══════════════════════════════════════════╝
def evaluate_single_game(min_train: int = 50):
    """Train on all games < index; predict one future game."""
    df = _load_data()
    test_idx = random.randrange(min_train, len(df))

    train_df = df.iloc[:test_idx]
    test_df = df.iloc[test_idx : test_idx + 1]

    pipe = _train_pipeline(train_df)
    X_test = test_df.drop(columns=["GAME_ID", "GAME_DATE", "HOME_WIN"])
    y_true = test_df["HOME_WIN"]
    y_pred = pipe.predict(X_test)
    y_prob = pipe.predict_proba(X_test)[:, 1]

    print("-" * 60)
    print(
        f"Evaluating GAME_ID {test_df.iloc[0]['GAME_ID']} "
        f"on {test_df.iloc[0]['GAME_DATE']}"
    )
    _print_metrics(_metric_dict(y_true, y_pred, y_prob))

    # Confusion matrix (1×1)
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_true, y_pred))


def evaluate_future_block(block_size: int = 30, min_train: int = 50) -> dict:
    """
    Train on past games; predict the next `block_size` games.
    Returns the metric dict for aggregation.
    """
    df = _load_data()
    cutoff = random.randrange(min_train, len(df) - block_size)

    train_df = df.iloc[:cutoff]
    test_df = df.iloc[cutoff : cutoff + block_size]

    pipe = _train_pipeline(train_df)
    X_test = test_df.drop(columns=["GAME_ID", "GAME_DATE", "HOME_WIN"])
    y_true = test_df["HOME_WIN"]
    y_pred = pipe.predict(X_test)
    y_prob = pipe.predict_proba(X_test)[:, 1]

    print("-" * 60)
    print(
        f"Evaluating block starting {test_df.iloc[0]['GAME_DATE']} "
        f"({block_size} games)"
    )
    block_metrics = _metric_dict(y_true, y_pred, y_prob)
    _print_metrics(block_metrics)
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_true, y_pred))

    return block_metrics


def evaluate_multiple_blocks(n_runs: int = 30, block_size: int = 30):
    """
    Run evaluate_future_block() `n_runs` times and print the mean ± stdev
    of each metric.
    """
    acc, prec, rec, f1s, aucs = [], [], [], [], []

    for _ in range(n_runs):
        m = evaluate_future_block(block_size=block_size)
        acc.append(m["accuracy"])
        prec.append(m["precision"])
        rec.append(m["recall"])
        f1s.append(m["f1"])
        if m["roc_auc"] is not None:
            aucs.append(m["roc_auc"])

    def _avg(lst):
        return mean(lst), (stdev(lst) if len(lst) > 1 else 0)

    avg_acc, sd_acc = _avg(acc)
    avg_prec, sd_prec = _avg(prec)
    avg_rec, sd_rec = _avg(rec)
    avg_f1, sd_f1 = _avg(f1s)
    avg_auc, sd_auc = _avg(aucs) if aucs else (None, None)

    print("\n" + "=" * 60)
    print(f"Averages across {n_runs} runs (block size {block_size}):")
    print(f"Accuracy : {avg_acc:.3f}  ± {sd_acc:.3f}")
    print(f"Precision: {avg_prec:.3f}  ± {sd_prec:.3f}")
    print(f"Recall   : {avg_rec:.3f}  ± {sd_rec:.3f}")
    print(f"F1 Score : {avg_f1:.3f}  ± {sd_f1:.3f}")
    if avg_auc is None:
        print("ROC-AUC  : n/a (some runs single-class)")
    else:
        print(f"ROC-AUC  : {avg_auc:.3f}  ± {sd_auc:.3f}")
    print("=" * 60 + "\n")


def save_full_history_model():
    """Train on *all* games and persist the model for API inference."""
    df = _load_data()
    pipe = _train_pipeline(df)
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipe, MODEL_PATH)
    print(f"Full-history model saved → {MODEL_PATH}")


# ╔══════════════════════════════════════════╗
# ║  CLI entry-point                         ║
# ╚══════════════════════════════════════════╝
if __name__ == "__main__":
    evaluate_single_game()                 # quick sanity check
    evaluate_future_block(block_size=50)   # one future window
    evaluate_multiple_blocks(n_runs=30, block_size=50)  # averaged metrics
    save_full_history_model()
