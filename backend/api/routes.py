# backend/api/routes.py
from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import List, Optional  # ← classic typing

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

# --------------------------------------------------------------------- #
# Data                                                                  #
# --------------------------------------------------------------------- #
BASE_DIR = Path(__file__).resolve().parents[2]
ODDS_CSV = BASE_DIR / "data" / "processed" / "predicted_odds.csv"

if not ODDS_CSV.exists():
    raise FileNotFoundError(
        f"{ODDS_CSV} not found. Generate it with "
        "`python backend/odds/make_market.py` first."
    )

_odds = pd.read_csv(ODDS_CSV, parse_dates=["GAME_DATE"])

# --------------------------------------------------------------------- #
# Pydantic model                                                        #
# --------------------------------------------------------------------- #
class GameOdds(BaseModel):
    game_id: int
    game_date: date
    home_abbrev: Optional[str] = None
    away_abbrev: Optional[str] = None
    ml_home: Optional[int] = None
    ml_away: Optional[int] = None
    p_home: Optional[float] = None
    p_away: Optional[float] = None


# --------------------------------------------------------------------- #
# Router                                                                #
# --------------------------------------------------------------------- #
router = APIRouter(prefix="/api", tags=["odds"])


@router.get("/game-days", summary="Game days")
def game_days() -> List[str]:
    """Return list of unique game dates (ISO yyyy-mm-dd)."""
    return sorted(_odds["GAME_DATE"].dt.date.astype(str).unique())


@router.get(
    "/odds",
    summary="Odds",
    response_model=List[GameOdds],
    description="Return all games + model-priced odds for the requested date.\n"
                "Query param:  ?date=YYYY-MM-DD",
)
def odds(date: str = Query(..., pattern=r"\d{4}-\d{2}-\d{2}")):
    # ------------------------------------------------------------------
    # Select rows for the requested date
    # ------------------------------------------------------------------
    rows = _odds.loc[_odds["GAME_DATE"] == pd.Timestamp(date)]
    if rows.empty:
        raise HTTPException(status_code=404, detail=f"No games on {date}")

    # ------------------------------------------------------------------
    # Rename to the snake_case fields expected by GameOdds
    # ------------------------------------------------------------------
    rows = rows.rename(
        columns={
            "GAME_ID": "game_id",
            "GAME_DATE": "game_date",
            "HOME_ABBREV": "home_abbrev",
            "AWAY_ABBREV": "away_abbrev",
            "ML_HOME": "ml_home",
            "ML_AWAY": "ml_away",
            "P_HOME": "p_home",
            "P_AWAY": "p_away",
        }
    )

    # ------------------------------------------------------------------
    # Replace NaN/Inf with None so the JSON is valid
    # ------------------------------------------------------------------
    rows = rows.replace([np.inf, -np.inf], np.nan).where(
        pd.notnull(rows), None
    )

    return jsonable_encoder(rows.to_dict(orient="records"))
