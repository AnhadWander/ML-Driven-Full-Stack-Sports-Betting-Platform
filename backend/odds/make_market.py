#!/usr/bin/env python3
"""
Price NBA games with the trained ensemble model.

v5 – unique money-lines
-----------------------
• same calibrated / shrunk / clipped probabilities as v4
• **new:** ±5 % multiplicative jitter on the final money-line
           (deterministic per GAME_ID) to avoid duplicate ±640 odds
"""
from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.isotonic import IsotonicRegression

# ── paths ──────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "backend" / "ml" / "rolling_model.pkl"
CALIB_PATH = BASE_DIR / "backend" / "ml" / "iso_calibrator.pkl"
FEAT_PATH  = BASE_DIR / "data"   / "processed" / "rolling_features.csv"
OUT_PATH   = BASE_DIR / "data"   / "processed" / "predicted_odds.csv"

NON_FEATURE = {"GAME_ID", "GAME_DATE", "HOME_WIN"}

# ── probability tuning ────────────────────────────────────────────────
PROB_FLOOR = 0.135          # ↔  +640 / –640
PROB_CEIL  = 0.865
SHRINK     = 0.90           # 10 % pull toward 0.50
JITTER_P   = 0.01           # ±1 % probability jitter
ODD_JITTER = 0.05           # ±5 % money-line jitter  ← NEW

# ── helpers ────────────────────────────────────────────────────────────
def prob_to_american(p: float) -> int:
    """Convert win probability to American money-line."""
    if not 0 < p < 1:
        raise ValueError("Probability must be between 0 and 1 exclusive")
    return int(-100 * p / (1 - p)) if p >= 0.5 else int(100 * (1 - p) / p)


def load_or_train_calibrator(y_true: np.ndarray,
                             raw_p: np.ndarray) -> IsotonicRegression:
    """Load isotonic calibrator, or train & persist if absent."""
    if CALIB_PATH.exists():
        return joblib.load(CALIB_PATH)

    iso = IsotonicRegression(out_of_bounds="clip")
    iso.fit(raw_p, y_true)
    joblib.dump(iso, CALIB_PATH)
    warnings.warn(f"Calibrator trained on-the-fly and saved → {CALIB_PATH}")
    return iso


# ── main ───────────────────────────────────────────────────────────────
def main() -> None:
    p = argparse.ArgumentParser(description="Make NBA betting markets")
    p.add_argument("-m", "--mode", choices=["test", "live"], default="test",
                   help="test = all rows; live = only future games")
    p.add_argument("--from", dest="from_date", metavar="YYYY-MM-DD",
                   help="Earliest GAME_DATE to price")
    args = p.parse_args()

    # artefacts ----------------------------------------------------------
    print(f"Loading model → {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)

    print(f"Loading features → {FEAT_PATH}")
    df = pd.read_csv(FEAT_PATH, parse_dates=["GAME_DATE"])

    # row subset ---------------------------------------------------------
    if args.from_date:
        subset = df[df["GAME_DATE"] >= pd.to_datetime(args.from_date)].copy()
    elif args.mode == "live":
        subset = df[df["GAME_DATE"] >= pd.Timestamp(date.today())].copy()
    else:
        subset = df.copy()

    if subset.empty:
        print("❌ Nothing to price – zero rows match the date filter.")
        return

    # model probabilities ------------------------------------------------
    X = subset.drop(columns=NON_FEATURE, errors="ignore").select_dtypes("number")
    raw_p_home = model.predict_proba(X)[:, 1]

    iso = load_or_train_calibrator(subset.get("HOME_WIN",
                                              np.round(raw_p_home)),
                                   raw_p_home)
    p_home = iso.transform(raw_p_home)
    p_home = 0.5 + SHRINK * (p_home - 0.5)                      # shrink
    rng_prob = np.random.default_rng(subset["GAME_ID"].values) # deterministic
    p_home += rng_prob.uniform(-JITTER_P, JITTER_P, len(p_home))
    p_home = np.clip(p_home, PROB_FLOOR, PROB_CEIL)
    p_away = 1.0 - p_home

    # american odds ------------------------------------------------------
    ml_home = np.array([prob_to_american(p) for p in p_home])
    ml_away = np.array([prob_to_american(p) for p in p_away])

    # ±5 % jitter on odds (deterministic per game) ----------------------  ← NEW
    rng_odd = np.random.default_rng(subset["GAME_ID"].values + 17)
    mult    = 1.0 + rng_odd.uniform(-ODD_JITTER, ODD_JITTER, len(ml_home))

    abs_home = (np.abs(ml_home) * mult).round().astype(int)
    abs_away = (np.abs(ml_away) * mult).round().astype(int)

    ml_home = np.sign(ml_home) * abs_home
    ml_away = np.sign(ml_away) * abs_away

    # assemble & save ----------------------------------------------------
    out = pd.DataFrame({
        "GAME_ID":   subset.get("GAME_ID", np.arange(len(subset))),
        "GAME_DATE": subset["GAME_DATE"],
        "ML_HOME":   ml_home,
        "ML_AWAY":   ml_away,
        "P_HOME":    p_home.round(3),
        "P_AWAY":    p_away.round(3),
    })

    out.to_csv(OUT_PATH, index=False)
    print(f"✅  Saved {len(out):,} rows → {OUT_PATH.relative_to(BASE_DIR)}")


if __name__ == "__main__":
    main()
