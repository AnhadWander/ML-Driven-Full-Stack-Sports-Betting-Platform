# scripts/build_rolling_features.py
"""
Build leakage-free 10-game rolling features and optional Vegas lines.

Output
------
data/processed/rolling_features.csv
"""

from pathlib import Path
import warnings
import pandas as pd

# ── paths ────────────────────────────────────────────────────────────────
GAMES = Path("data/processed/cleaned_games.csv")
ODDS  = Path("data/processed/odds.csv")          # optional
DEST  = Path("data/processed/rolling_features.csv")

ROLL_N, MIN_GMS = 10, 3
BOX = [
    "PTS", "FG_PCT", "FG3_PCT", "FT_PCT",
    "OREB", "DREB", "REB", "AST",
    "STL", "BLK", "TOV", "PF", "PLUS_MINUS",
]

# ── helpers ──────────────────────────────────────────────────────────────
def _long(df: pd.DataFrame, side: str) -> pd.DataFrame:
    tid  = f"TEAM_ID_{side}"
    cols = [f"{s}_{side}" for s in BOX]
    out  = df[["GAME_ID", "GAME_DATE", tid] + cols + ["PTS_HOME", "PTS_AWAY", "HOME_WIN"]].copy()

    out.columns = ["GAME_ID", "GAME_DATE", "TEAM_ID"] + BOX + ["PTS_HOME", "PTS_AWAY", "HOME_WIN"]
    out["WIN"]  = out["HOME_WIN"] if side == "HOME" else 1 - out["HOME_WIN"]
    out["PT_DIFF"] = (
        out["PTS_HOME"] - out["PTS_AWAY"] if side == "HOME"
        else out["PTS_AWAY"] - out["PTS_HOME"]
    )
    return out.drop(columns=["PTS_HOME", "PTS_AWAY", "HOME_WIN"])


def _rolling(df_long: pd.DataFrame) -> pd.DataFrame:
    frames, num_cols = [], BOX + ["WIN", "PT_DIFF"]
    for _, grp in df_long.sort_values("GAME_DATE").groupby("TEAM_ID", sort=False):
        rolled = grp[num_cols].shift(1).rolling(ROLL_N, min_periods=MIN_GMS).mean()
        rolled.columns = [f"R{ROLL_N}_{c}" for c in rolled.columns]
        frames.append(
            pd.concat([grp[["GAME_ID"]].reset_index(drop=True), rolled], axis=1)
        )
    return pd.concat(frames, ignore_index=True)

# ── main ────────────────────────────────────────────────────────────────
def main() -> None:
    games = pd.read_csv(GAMES, parse_dates=["GAME_DATE"])

    # 1️⃣  rolling features
    roll_h = _rolling(_long(games, "HOME"))
    roll_a = _rolling(_long(games, "AWAY"))
    games  = (
        games.merge(roll_h, on="GAME_ID", how="left")
             .merge(roll_a, on="GAME_ID", how="left", suffixes=("", "_A"))
    )

    # 2️⃣  HOME–AWAY differentials
    diff_cols = [c for c in games.columns if c.startswith(f"R{ROLL_N}_") and not c.endswith("_A")]
    for col in diff_cols:
        games[f"{col}_DIFF"] = games[col] - games[f"{col}_A"]

    # 3️⃣  Vegas opening lines (optional)
    if ODDS.exists():
        odds = pd.read_csv(ODDS, parse_dates=["GAME_DATE"])
        games = games.merge(
            odds,
            on=["GAME_DATE", "TEAM_NAME_HOME", "TEAM_NAME_AWAY"],
            how="left",
            validate="1:1",
        )
    else:
        warnings.warn("odds.csv not found – Vegas columns will be NaN")

    # 4️⃣  Keep leakage-free columns
    feature_cols = [c for c in games.columns if c.startswith(f"R{ROLL_N}_") or c.startswith("OPEN_")]
    final = games[["GAME_ID", "GAME_DATE", "HOME_WIN"] + feature_cols].dropna(axis=1, how="all")

    DEST.parent.mkdir(parents=True, exist_ok=True)
    final.to_csv(DEST, index=False)
    print(f"✅  Saved {len(final):,} rows • {len(final.columns)-3} features → {DEST}")


if __name__ == "__main__":
    warnings.filterwarnings("ignore", category=FutureWarning)
    main()
