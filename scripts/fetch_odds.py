"""
scripts/fetch_odds.py
──────────────────────────────────────────────────────────────
Pulls opening spread (+/- points) and money-line (American odds)
for every NBA game date between START_DATE and END_DATE using
The-Odds-API and saves them to data/external/odds.csv
"""

import os, time, requests, pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()                         
API_KEY = os.getenv("ODDS_KEY")
assert API_KEY, "Set ODDS_KEY in env or .env"

START_DATE = datetime(2022, 10, 1)    
END_DATE   = datetime(2025, 6, 30)    

TEAM_MAP = (                         
    pd.read_csv("data/static/odds_team_map.csv")
      .set_index("ODDS_NAME")["TEAM_ABBREV"]
      .to_dict()
)

out_rows = []
OUT_FILE = "data/external/odds.csv"
os.makedirs("data/external", exist_ok=True)

def american_to_prob(american):
    """Convert American odds to implied win probability (0-1)."""
    if american >= 0:
        return 100 / (american + 100)
    return -american / (-american + 100)

def fetch_day(day: datetime):
    iso = day.strftime("%Y-%m-%d")
    url = (
        "https://api.the-odds-api.com/v4/sports/basketball_nba/odds"
        f"?apiKey={API_KEY}"
        "&regions=us"
        "&markets=spreads,h2h"
        "&bookmakers=draftkings"
        f"&date={iso}"
        "&oddsFormat=american&dateFormat=iso"
    )
    r = requests.get(url, timeout=10)
    if r.status_code != 200:
        print("skip", iso, r.status_code)
        return

    for game in r.json():
        home_name = game["home_team"]
        away_name = game["away_team"]         
        if home_name not in TEAM_MAP or away_name not in TEAM_MAP:
            continue  

        h_abbr = TEAM_MAP[home_name]
        a_abbr = TEAM_MAP[away_name]

        bm = game["bookmakers"][0]
        spreads = next(m for m in bm["markets"] if m["key"] == "spreads")["outcomes"]
        h_spread = next(o for o in spreads if o["name"] == home_name)["point"]
        a_spread = next(o for o in spreads if o["name"] == away_name)["point"]

        h2h = next(m for m in bm["markets"] if m["key"] == "h2h")["outcomes"]
        h_ml = next(o for o in h2h if o["name"] == home_name)["price"]
        a_ml = next(o for o in h2h if o["name"] == away_name)["price"]

        out_rows.append({
            "GAME_DATE": iso,
            "HOME_ABBREV": h_abbr,
            "AWAY_ABBREV": a_abbr,
            "OPEN_SPREAD_HOME": h_spread,
            "OPEN_SPREAD_AWAY": a_spread,
            "OPEN_ML_HOME": h_ml,
            "OPEN_ML_AWAY": a_ml,
            "IMPLIED_HOME": american_to_prob(h_ml),
            "IMPLIED_AWAY": american_to_prob(a_ml),
        })

print("Fetching odds …")
day = START_DATE
while day <= END_DATE:
    fetch_day(day)
    day += timedelta(days=1)
    time.sleep(0.8)        

pd.DataFrame(out_rows).to_csv(OUT_FILE, index=False)
print("Saved →", OUT_FILE, len(out_rows), "rows")
