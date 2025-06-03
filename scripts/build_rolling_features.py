# scripts/build_rolling_features.py
"""
Create rolling-feature file for each NBA game, including:
• box-score rolling gaps
• last-10 win % & point diff gaps
• advanced NET/OFF/DEF ratings
• rest-days, back-to-back, travel km
• injury-minutes proxy
"""

import os, random
import pandas as pd
from collections import defaultdict, deque
from dateutil import parser
from geopy.distance import geodesic

RAW_CLEAN = "data/processed/cleaned_games.csv"
TEAM_META = "data/static/team_meta.csv"
TEAM_ADV  = "data/processed/team_adv_2024-25.csv"
OUT_FILE  = "data/processed/rolling_features.csv"

STAT_COLS = [
    "FG_PCT","FG3_PCT","FT_PCT",
    "OREB","DREB","AST","STL","BLK","TOV","PF"
]

# ─────────────────────────── helpers ────────────────────────────
meta_df  = pd.read_csv(TEAM_META)
adv_base = pd.read_csv(TEAM_ADV).set_index("TEAM_ID")

def arena_coords(team_id):
    r = meta_df.loc[meta_df.TEAM_ID == team_id]
    return (r.iloc[0]["LAT"], r.iloc[0]["LON"])

def travel_km(prev_latlon, team_id):
    if prev_latlon is None:
        return 0.0
    return geodesic(prev_latlon, arena_coords(team_id)).km

# rolling storage
counters   = defaultdict(lambda: {"n":0, **{c:0.0 for c in STAT_COLS}})
last10_q   = defaultdict(lambda: deque(maxlen=10))
last_date  = defaultdict(lambda: None)
last_city  = defaultdict(lambda: None)
inj_minutes= defaultdict(lambda: 0.0)

records = []

df_games = (
    pd.read_csv(RAW_CLEAN)
      .sort_values("GAME_DATE")          # <<< use GAME_DATE (no _HOME)
      .reset_index(drop=True)
)

for _, row in df_games.iterrows():
    home_id = row["TEAM_ID_HOME"]
    away_id = row["TEAM_ID_AWAY"]
    game_dt = parser.parse(row["GAME_DATE"])

    # 1 ─ rolling averages
    def avg_stats(team):
        info = counters[team]
        if info["n"] == 0:
            return {f"{c}_AVG":0.5 for c in STAT_COLS}
        return {f"{c}_AVG":info[c]/info["n"] for c in STAT_COLS}

    home_avg = avg_stats(home_id)
    away_avg = avg_stats(away_id)

    # 2 ─ last-10 form
    def form(team):
        q = last10_q[team]
        if not q: return 0.5, 0.0
        wins = sum(1 for d in q if d>0)
        return wins/len(q), sum(q)/len(q)

    home_w10, home_pd10 = form(home_id)
    away_w10, away_pd10 = form(away_id)

    # 3 ─ advanced season ratings
    home_adv = adv_base.loc[home_id]
    away_adv = adv_base.loc[away_id]

    # 4 ─ rest & travel
    rest_home = (game_dt - last_date[home_id]).days if last_date[home_id] else 7
    rest_away = (game_dt - last_date[away_id]).days if last_date[away_id] else 7

    km_home = travel_km(last_city[home_id], home_id)
    km_away = travel_km(last_city[away_id], away_id)

    # 5 ─ injury-minutes proxy (season-to-date)
    inj_diff = inj_minutes[home_id] - inj_minutes[away_id]

    # assemble feature row
    feat = {
        "GAME_ID": row["GAME_ID"],
        "GAME_DATE": row["GAME_DATE"],
        "HOME_WIN": row["HOME_WIN"],

        **{f"{c}_DIFF": home_avg[f"{c}_AVG"] - away_avg[f"{c}_AVG"] for c in STAT_COLS},
        "WIN_PCT10_DIFF": home_w10 - away_w10,
        "PT_DIFF10_DIFF": home_pd10 - away_pd10,
        "NET_RTG_DIFF": home_adv.NET_RATING - away_adv.NET_RATING,
        "OFF_RTG_DIFF": home_adv.OFF_RATING - away_adv.OFF_RATING,
        "DEF_RTG_DIFF": home_adv.DEF_RATING - away_adv.DEF_RATING,
        "PACE_DIFF":    home_adv.PACE       - away_adv.PACE,
        "REST_DAYS_DIFF": rest_home - rest_away,
        "BACK2BACK_HOME": 1 if rest_home==0 else 0,
        "BACK2BACK_AWAY": 1 if rest_away==0 else 0,
        "TRAVEL_KM_DIFF": km_home - km_away,
        "INJ_MIN_DIFF": inj_diff,
    }
    records.append(feat)

    # update rolling stores
    pdiff_home = row["PTS_HOME"] - row["PTS_AWAY"]
    for team, side in [(home_id,"_HOME"), (away_id,"_AWAY")]:
        info = counters[team]
        info["n"] += 1
        for c in STAT_COLS:
            info[c] += row[f"{c}{side}"]
        last10_q[team].append(pdiff_home if team==home_id else -pdiff_home)
        last_date[team] = game_dt
        last_city[team] = arena_coords(team)
        # crude injury proxy: minutes missing from 240
        active_min = row[f"MIN{side}"]
        inj_minutes[team] += max(240 - active_min, 0)

# save
os.makedirs("data/processed", exist_ok=True)
pd.DataFrame(records).to_csv(OUT_FILE, index=False)
print("Saved →", OUT_FILE)

# show random example
sample = pd.read_csv(OUT_FILE).sample(1, random_state=random.randint(0,9999))
print("\nExample feature row:")
print(sample.T)
