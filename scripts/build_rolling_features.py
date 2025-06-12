#!/usr/bin/env python3
"""
Create one row per NBA game with team-level rolling-window features
+ Vegas opener information.

Input
-----
data/external/nba_betting_data.csv    # Kaggle play-by-play summary
data/external/odds.csv                # Vegas openers

Output
------
data/processed/rolling_features.csv
"""

import warnings
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]        # project root
RAW_GAMES = ROOT / "data" / "external" / "nba_betting_data.csv"
RAW_ODDS  = ROOT / "data" / "external" / "odds.csv"
OUTFILE   = ROOT / "data" / "processed" / "rolling_features.csv"

ROLL_N = 10          # games in look-back window
SEASONS_BACK = 3     # keep last N seasons only


# ------------------------------------------------------------------ #
# 1.  READ & NORMALISE  GAME RESULTS (kaggle file)                    #
# ------------------------------------------------------------------ #
def load_games() -> pd.DataFrame:
    """
    Return a DF with one **game** per row, plus helper columns:

    GAME_DATE (datetime64[ns])
    HOME_ABBREV  |  AWAY_ABBREV   (3-letter upper-case)
    PTS_HOME     |  PTS_AWAY
    HOME_WIN (1/0)
    PDIFF_HOME  – point diff from home side perspective
    """
    df = pd.read_csv(RAW_GAMES)

    # ─── rename / coerce ────────────────────────────────────────────
    df = df.rename(
        columns={
            "date": "GAME_DATE",
            "home": "HOME_ABBREV",
            "away": "AWAY_ABBREV",
            "score_home": "PTS_HOME",
            "score_away": "PTS_AWAY",
        }
    )

    # abbreviations are already lower-case 3-letter; capitalise to match odds
    df["HOME_ABBREV"] = df["HOME_ABBREV"].str.upper()
    df["AWAY_ABBREV"] = df["AWAY_ABBREV"].str.upper()

    df["GAME_DATE"]   = pd.to_datetime(df["GAME_DATE"], errors="coerce")

    # keep only last N seasons
    most_recent_season = df["season"].max()
    df = df.loc[df["season"] >= most_recent_season - SEASONS_BACK + 1].copy()

    # helper targets
    df["HOME_WIN"]   = (df["PTS_HOME"] > df["PTS_AWAY"]).astype(int)
    df["PDIFF_HOME"] = df["PTS_HOME"] - df["PTS_AWAY"]

    df = (
        df[["GAME_DATE", "HOME_ABBREV", "AWAY_ABBREV",
             "PTS_HOME", "PTS_AWAY", "HOME_WIN", "PDIFF_HOME"]]
        .sort_values("GAME_DATE")
        .reset_index(drop=True)
    )
    return df


# ------------------------------------------------------------------ #
# 2.  ADD VEGAS OPENERS                                               #
# ------------------------------------------------------------------ #
def load_odds() -> pd.DataFrame:
    """
    columns: GAME_DATE, HOME_ABBREV, AWAY_ABBREV,
             OPEN_SPREAD_HOME, OPEN_SPREAD_AWAY,
             OPEN_ML_HOME, OPEN_ML_AWAY, IMPLIED_HOME, IMPLIED_AWAY
    """
    if not RAW_ODDS.exists():
        warnings.warn("odds.csv not found — Vegas columns will be NaN")
        return pd.DataFrame(
            columns=[
                "GAME_DATE", "HOME_ABBREV", "AWAY_ABBREV",
                "OPEN_SPREAD_HOME", "OPEN_SPREAD_AWAY",
                "OPEN_ML_HOME", "OPEN_ML_AWAY",
                "IMPLIED_HOME", "IMPLIED_AWAY",
            ]
        )

    odds = pd.read_csv(RAW_ODDS)
    odds["GAME_DATE"] = pd.to_datetime(odds["GAME_DATE"])
    odds["HOME_ABBREV"] = odds["HOME_ABBREV"].str.upper()
    odds["AWAY_ABBREV"] = odds["AWAY_ABBREV"].str.upper()
    return odds


# ------------------------------------------------------------------ #
# 3.  ROLLING-WINDOW TEAM FEATURES                                    #
# ------------------------------------------------------------------ #
def team_rolling_stats(games: pd.DataFrame) -> pd.DataFrame:
    """
    Compute last-N-games rolling averages **per team** then
    widen so we have home + away features on the same row.
    """
    # melt to team-centric long form
    long = pd.concat(
        [
            games.rename(
                columns={
                    "HOME_ABBREV": "TEAM",
                    "PTS_HOME": "PTS",
                    "HOME_WIN": "WIN",
                    "PDIFF_HOME": "PD"
                }
            )[["GAME_DATE", "TEAM", "PTS", "WIN", "PD"]],
            games.rename(
                columns={
                    "AWAY_ABBREV": "TEAM",
                    "PTS_AWAY": "PTS",
                }
            )[["GAME_DATE", "TEAM", "PTS"]]
            .assign(WIN=lambda d: 1 - games["HOME_WIN"].values,   # away win flag
                    PD=lambda d: -games["PDIFF_HOME"].values),     # invert diff
        ]
    )

    long = long.sort_values(["TEAM", "GAME_DATE"])

    # rolling means
    roll = (
        long
        .groupby("TEAM")
        .rolling(ROLL_N, on="GAME_DATE", min_periods=1)
        .agg({
            "PTS": "mean",
            "WIN": "mean",
            "PD":  "mean"
        })
        .reset_index()
        .rename(columns={
            "PTS": f"R{ROLL_N}_PTS",
            "WIN": f"R{ROLL_N}_WIN",
            "PD":  f"R{ROLL_N}_PD"
        })
    )

    # merge back (wide: home/away)
    games = games.merge(
        roll.rename(columns=lambda c: c + "_HOME" if c.startswith(f"R{ROLL_N}") else c),
        left_on=["HOME_ABBREV", "GAME_DATE"],
        right_on=["TEAM", "GAME_DATE"],
        how="left",
    ).drop(columns="TEAM")

    games = games.merge(
        roll.rename(columns=lambda c: c + "_AWAY" if c.startswith(f"R{ROLL_N}") else c),
        left_on=["AWAY_ABBREV", "GAME_DATE"],
        right_on=["TEAM", "GAME_DATE"],
        how="left",
    ).drop(columns="TEAM")

    # convenience diffs (home – away)
    for base in [f"R{ROLL_N}_PTS", f"R{ROLL_N}_WIN", f"R{ROLL_N}_PD"]:
        games[f"{base}_DIFF"] = games[f"{base}_HOME"] - games[f"{base}_AWAY"]

    return games


# ------------------------------------------------------------------ #
# 4.  MAIN                                                            #
# ------------------------------------------------------------------ #
def main() -> None:
    games = load_games()
    odds  = load_odds()

    # join Vegas openers
    games = games.merge(
        odds,
        on=["GAME_DATE", "HOME_ABBREV", "AWAY_ABBREV"],
        how="left"
    )

    games = team_rolling_stats(games)

    # keep only numeric features + ID columns (for modelling pipeline)
    feature_cols = [c for c in games.columns if c.startswith(("R", "OPEN_", "IMPLIED_"))]
    final = games[["GAME_DATE", "HOME_ABBREV", "AWAY_ABBREV", "HOME_WIN"] + feature_cols]

    final.to_csv(OUTFILE, index=False)
    print(
        f"✅  Saved {len(final):,} rows • {len(feature_cols)} features → "
        f"{OUTFILE.relative_to(ROOT)}"
    )


if __name__ == "__main__":
    main()
