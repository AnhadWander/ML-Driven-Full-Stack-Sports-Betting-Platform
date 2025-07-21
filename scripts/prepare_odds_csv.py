"""
Convert Kaggle nba_betting_data.csv → odds.csv for last 3 seasons.

• Uses real money-lines when present.
• When money-line missing, infers implied win-prob from spread
  via the 6-point rule and back-computes a synthetic American line.
"""

import os, sys, pandas as pd
from datetime import datetime
import numpy as np

RAW = "data/external/nba_betting_data.csv"
OUT = "data/external/odds.csv"

if not os.path.exists(RAW):
    sys.exit(f"{RAW} not found")

df = pd.read_csv(RAW, parse_dates=["date"])
df = df[(df["regular"] == True) & (df["date"] >= "2022-10-01")].copy()

MAP2 = {
    "atl": "ATL","bos": "BOS","bro":"BKN","bkn":"BKN",
    "cha": "CHA","chi": "CHI","cle":"CLE","dal":"DAL",
    "den": "DEN","det": "DET","gs":"GSW","gsw":"GSW",
    "hou": "HOU","ind": "IND","lac":"LAC","lal":"LAL",
    "mem": "MEM","mia": "MIA","mil":"MIL","min":"MIN",
    "no": "NOP","nor":"NOP","nop":"NOP","ny":"NYK","nyk":"NYK",
    "okc":"OKC","orl":"ORL","phi":"PHI","pho":"PHX","phx":"PHX",
    "por":"POR","sac":"SAC","sa":"SAS","sas":"SAS","tor":"TOR",
    "uta":"UTA","was":"WAS","wsh":"WAS"
}
df["HOME_ABBREV"] = df["home"].str.lower().map(MAP2)
df["AWAY_ABBREV"] = df["away"].str.lower().map(MAP2)
df = df.dropna(subset=["HOME_ABBREV","AWAY_ABBREV"])

def signed_spread(r):
    s = r["spread"]
    if pd.isna(s): return None
    return -s if r["whos_favored"] == "home" else s

df["OPEN_SPREAD_HOME"] = df.apply(signed_spread, axis=1)
df["OPEN_SPREAD_AWAY"] = -df["OPEN_SPREAD_HOME"]

def american_to_prob(x):
    if pd.isna(x): return None
    x = float(x)
    return 100/(x+100) if x>=0 else -x/(-x+100)

df["IMPLIED_HOME"] = df["moneyline_home"].apply(american_to_prob)
df["IMPLIED_AWAY"] = df["moneyline_away"].apply(american_to_prob)

needs_ml = df["IMPLIED_HOME"].isna()

def spread_to_prob(spread_home):
    if pd.isna(spread_home): return None
    return 1 / (1 + 10 ** (spread_home / 6.5))

df.loc[needs_ml, "IMPLIED_HOME"] = df.loc[needs_ml,"OPEN_SPREAD_HOME"].apply(spread_to_prob)
df.loc[needs_ml, "IMPLIED_AWAY"] = 1 - df.loc[needs_ml,"IMPLIED_HOME"]

def prob_to_american(p):
    if pd.isna(p): return None
    p = max(min(p, 0.999), 0.001)
    return round(100 * p / (1 - p)) if p < 0.5 else round(-100 * (1 - p) / p)

df["OPEN_ML_HOME"] = np.where(
        df["moneyline_home"].notna(),
        df["moneyline_home"],
        df["IMPLIED_HOME"].apply(prob_to_american)
)
df["OPEN_ML_AWAY"] = np.where(
        df["moneyline_away"].notna(),
        df["moneyline_away"],
        df["IMPLIED_AWAY"].apply(prob_to_american)
)

out = df[[
    "date","HOME_ABBREV","AWAY_ABBREV",
    "OPEN_SPREAD_HOME","OPEN_SPREAD_AWAY",
    "OPEN_ML_HOME","OPEN_ML_AWAY",
    "IMPLIED_HOME","IMPLIED_AWAY"
]].copy()

out.columns = [
    "GAME_DATE","HOME_ABBREV","AWAY_ABBREV",
    "OPEN_SPREAD_HOME","OPEN_SPREAD_AWAY",
    "OPEN_ML_HOME","OPEN_ML_AWAY",
    "IMPLIED_HOME","IMPLIED_AWAY"
]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
out.to_csv(OUT, index=False)
print(f"Saved {len(out):,} rows → {OUT}")
