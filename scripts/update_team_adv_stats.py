"""
Pull season-to-date Advanced ratings (OFF/DEF/NET/PACE) for every NBA team.
Writes data/processed/team_adv_<SEASON>.csv
"""

import os, time, random
import pandas as pd
from nba_api.stats.static import teams
from nba_api.stats.endpoints import teamdashboardbygeneralsplits
from requests.exceptions import ReadTimeout, ConnectionError

SEASON = "2024-25"                             
OUT    = f"data/processed/team_adv_{SEASON}.csv"
MAX_RETRIES = 3
PAUSE_SEC   = 0.7                              

os.makedirs("data/processed", exist_ok=True)

records = []

def fetch_one(team_id: int) -> dict:
    """Return OFF/DEF/NET/PACE as a dict for the given team_id."""
    dash = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(
        team_id=team_id,
        season=SEASON,
        measure_type_detailed_defense="Advanced",
        per_mode_detailed="PerGame",
    )
    df = dash.get_data_frames()[0]              
    row = df.iloc[0]
    return {
        "TEAM_ID":     team_id,
        "OFF_RATING":  row["OFF_RATING"],
        "DEF_RATING":  row["DEF_RATING"],
        "NET_RATING":  row["NET_RATING"],
        "PACE":        row["PACE"],
    }

for t in teams.get_teams():
    tid   = t["id"]
    name  = t["full_name"]
    tried = 0
    while tried < MAX_RETRIES:
        try:
            rec = fetch_one(tid)
            records.append(rec)
            print(f"OK  {name:25}  ORtg {rec['OFF_RATING']:>6.1f}")
            break
        except (KeyError, ReadTimeout, ConnectionError) as e:
            tried += 1
            if tried == MAX_RETRIES:
                print(f"ERR {name:25}  → {e}")
            else:
                sleep_for = PAUSE_SEC + random.random() * 0.5
                print(f"...retry {name} in {sleep_for:.1f}s")
                time.sleep(sleep_for)
    time.sleep(PAUSE_SEC)                       
pd.DataFrame(records).to_csv(OUT, index=False)
print("\nSaved →", OUT, "with", len(records), "teams")
