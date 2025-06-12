#!/usr/bin/env python3
"""
Evaluate rolling NBA model on historical data.

* 30 “future window” evaluations (50-game blocks)
* 1 final single-game check (latest game)

Requires: data/processed/rolling_features.csv
"""

from __future__ import annotations

from pathlib import Path
from statistics import mean, stdev
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, VotingClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score, roc_auc_score)
from sklearn.pipeline import Pipeline

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
DATA_FILE   = Path("data/processed/rolling_features.csv")
MODEL_OUT   = Path("backend/ml/rolling_model.pkl")

BLOCK_SIZE  = 50
N_RUNS      = 30
RANDOM_SEED = 42

DROP_ALWAYS     = ["GAME_DATE", "HOME_WIN"]       # never used for training
OPTIONAL_DROPS  = ["GAME_ID"]                     # drop if present
IMPUTE_STRAT    = "median"
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def _safe_drop(df: pd.DataFrame) -> pd.DataFrame:
    """Return numeric features excl. DROP_ALWAYS + OPTIONAL_DROPS (if present)."""
    to_drop = DROP_ALWAYS + [c for c in OPTIONAL_DROPS if c in df.columns]
    return df.drop(columns=to_drop, errors="ignore").select_dtypes("number")


def _build_model() -> Pipeline:
    """Pipeline: median-impute → voting(GB + GB-as-XGB-stand-in)."""
    num_pipe = Pipeline([("imputer", SimpleImputer(strategy=IMPUTE_STRAT))])
    pre      = ColumnTransformer([("num", num_pipe, slice(None))], remainder="drop")

    gb  = GradientBoostingClassifier(random_state=RANDOM_SEED)
    xgb = GradientBoostingClassifier(
        random_state=RANDOM_SEED, learning_rate=0.05,
        n_estimators=400, subsample=0.8, max_depth=3
    )

    ens = VotingClassifier(
        estimators=[("gb", gb), ("xgb", xgb)],
        voting="soft",
        n_jobs=-1,
    )

    return Pipeline([("pre", pre), ("model", ens)])


def _metrics(y_true, y_pred, proba=None) -> dict[str, float]:
    out = dict(
        acc  = accuracy_score(y_true, y_pred),
        prec = precision_score(y_true, y_pred, zero_division=0),
        rec  = recall_score(y_true, y_pred, zero_division=0),
        f1   = f1_score(y_true, y_pred, zero_division=0),
    )
    if proba is not None and len(set(y_true)) == 2:
        out["auc"] = roc_auc_score(y_true, proba[:, 1])
    return out


def _print_block_header(label: str):
    print("-" * 60)
    print(label)


def _print_block_results(m: dict[str, float]):
    print(f"Accuracy : {m['acc'] :0.3f}")
    print(f"Precision: {m['prec']:0.3f}")
    print(f"Recall   : {m['rec'] :0.3f}")
    print(f"F1 Score : {m['f1']  :0.3f}")
    if "auc" in m:
        print(f"ROC-AUC  : {m['auc']:0.3f}")
    print()


# ---------------------------------------------------------------------------
# MAIN EVALUATION
# ---------------------------------------------------------------------------
def main():
    warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

    df = pd.read_csv(DATA_FILE, parse_dates=["GAME_DATE"])
    df.sort_values("GAME_DATE", inplace=True)
    df.reset_index(drop=True, inplace=True)

    # -------------------------------------------------------- #
    # Single latest-game check
    # -------------------------------------------------------- #
    train_latest = df.iloc[:-1]
    test_latest  = df.iloc[-1:]

    pipe = _build_model()
    pipe.fit(_safe_drop(train_latest), train_latest["HOME_WIN"])
    y_pred = pipe.predict(_safe_drop(test_latest))
    y_prob = pipe.predict_proba(_safe_drop(test_latest))

    _print_block_header(
        f"Evaluating GAME_ID {test_latest.get('GAME_ID', pd.Series(['?'])).values[0]} "
        f"on {test_latest['GAME_DATE'].dt.date.values[0]}"
    )
    m = _metrics(test_latest["HOME_WIN"], y_pred, y_prob)
    _print_block_results(m)
    print("Confusion Matrix:")
    print(confusion_matrix(test_latest["HOME_WIN"], y_pred))
    print("-" * 60)

    # -------------------------------------------------------- #
    # 30 future-window runs (BLOCK_SIZE each)
    # -------------------------------------------------------- #
    rng = np.random.default_rng(RANDOM_SEED)
    start_indices = rng.choice(
        range(len(df) - BLOCK_SIZE),
        size=N_RUNS,
        replace=False,
    )
    results: list[dict[str, float]] = []

    for idx, start in enumerate(sorted(start_indices), 1):
        test  = df.iloc[start : start + BLOCK_SIZE]
        train = df.iloc[:start]

        if train.empty:
            # not enough past games – skip this window
            continue

        pipe = _build_model()
        pipe.fit(_safe_drop(train), train["HOME_WIN"])

        y_pred = pipe.predict(_safe_drop(test))
        y_prob = pipe.predict_proba(_safe_drop(test))

        m = _metrics(test["HOME_WIN"], y_pred, y_prob)
        results.append(m)

        _print_block_header(
            f"Run {idx:02d}/{N_RUNS} — block starting "
            f"{test['GAME_DATE'].dt.date.values[0]} ({BLOCK_SIZE} games)"
        )
        _print_block_results(m)
        print("Confusion Matrix:")
        print(confusion_matrix(test["HOME_WIN"], y_pred))

    # -------------------------------------------------------- #
    # Summary stats
    # -------------------------------------------------------- #
    if results:
        print("=" * 60)
        print(f"Averages across {len(results)} runs (block size {BLOCK_SIZE}):")
        for k in ("acc", "prec", "rec", "f1", "auc"):
            vals = [r[k] for r in results if k in r]
            if not vals:
                continue
            print(f"{k.upper():9}: {mean(vals):0.3f}  ± {stdev(vals):0.3f}")
        print("=" * 60)

    # -------------------------------------------------------- #
    # Save full-history model for inference
    # -------------------------------------------------------- #
    full_pipe = _build_model()
    full_pipe.fit(_safe_drop(df), df["HOME_WIN"])
    MODEL_OUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(full_pipe, MODEL_OUT)
    print(f"\n✅  full-history model saved → {MODEL_OUT}")


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    main()
