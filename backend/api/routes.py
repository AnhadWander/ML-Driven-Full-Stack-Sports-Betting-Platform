from __future__ import annotations

from pathlib import Path
from typing import List

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from fastapi.encoders import jsonable_encoder

pd.set_option("future.no_silent_downcasting", True)

# --------------------------------------------------------------------------- #
# Paths                                                                       #
# --------------------------------------------------------------------------- #
BASE_DIR = Path(__file__).resolve().parents[2]

PREDICTED = BASE_DIR / "data" / "processed" / "predicted_odds.csv"
CLEANED   = BASE_DIR / "data" / "processed" / "cleaned_games.csv"
META      = BASE_DIR / "data" / "static"    / "team_meta.csv"

for f in (PREDICTED, CLEANED, META):
    if not f.exists():
        raise FileNotFoundError(f"Required file missing → {f}")

# --------------------------------------------------------------------------- #
# Build enriched odds DataFrame                                               #
# --------------------------------------------------------------------------- #
odds = pd.read_csv(PREDICTED, parse_dates=["GAME_DATE"])
games = pd.read_csv(CLEANED,   parse_dates=["GAME_DATE"])
meta  = pd.read_csv(META, usecols=["TEAM_ID", "TEAM_ABBREV"])

odds["ROW"]  = odds.groupby("GAME_DATE").cumcount()
games["ROW"] = games.groupby("GAME_DATE").cumcount()

odds = odds.merge(
    games[["GAME_DATE", "ROW", "TEAM_ID_HOME", "TEAM_ID_AWAY"]],
    on=["GAME_DATE", "ROW"],
    how="left",
)

meta_home = meta.rename(columns={"TEAM_ID": "TEAM_ID_HOME",
                                 "TEAM_ABBREV": "HOME_ABBREV"})
meta_away = meta.rename(columns={"TEAM_ID": "TEAM_ID_AWAY",
                                 "TEAM_ABBREV": "AWAY_ABBREV"})

odds = (
    odds
    .merge(meta_home, on="TEAM_ID_HOME", how="left")
    .merge(meta_away, on="TEAM_ID_AWAY", how="left")
)

odds = odds.rename(
    columns={
        "GAME_ID": "game_id",
        "GAME_DATE": "game_date",
        "ML_HOME": "ml_home",
        "ML_AWAY": "ml_away",
        "P_HOME": "p_home",
        "P_AWAY": "p_away",
        "HOME_ABBREV": "home_abbrev",
        "AWAY_ABBREV": "away_abbrev",
    }
).set_index("game_date")

# --------------------------------------------------------------------------- #
# FastAPI router                                                              #
# --------------------------------------------------------------------------- #
router = APIRouter(prefix="/api")


@router.get("/game-days", summary="List all available game dates")
def game_days() -> List[str]:
    return sorted(d.date().isoformat() for d in odds.index.unique())


@router.get("/odds", summary="Money-line odds for one day")
def odds_for_day(date: str = Query(..., pattern=r"\d{4}-\d{2}-\d{2}")):
    try:
        day = pd.to_datetime(date).normalize()
    except ValueError:
        raise HTTPException(status_code=422, detail="Bad date format YYYY-MM-DD expected")

    rows = odds.loc[odds.index == day]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No games on {date}")

    # ------------------------------------------------------------------ #
    # Sanitize for JSON                                                  #
    # ------------------------------------------------------------------ #
    rows = rows.replace([np.inf, -np.inf], np.nan)        # ±inf → NaN
    rows = rows.where(pd.notnull(rows), None)             # NaN → None

    # ---- NEW: make sure object columns don't carry NaN ---------------- #
    rows["home_abbrev"] = rows["home_abbrev"].fillna("")  # ①
    rows["away_abbrev"] = rows["away_abbrev"].fillna("")  # ②
    # ------------------------------------------------------------------- #

    payload = rows[
        ["game_id", "ml_home", "ml_away",
         "p_home",  "p_away",
         "home_abbrev", "away_abbrev"]
    ].reset_index(drop=True)

    print(payload.head().to_dict("records"))              # ③ handy debug

    return jsonable_encoder(payload.to_dict(orient="records"))
