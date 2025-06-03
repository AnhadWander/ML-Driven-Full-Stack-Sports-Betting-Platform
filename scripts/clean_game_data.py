# scripts/clean_game_data.py
"""
Merge raw game logs into one-row-per-match with home/away suffixes
and extra columns: TEAM_ID_HOME/AWAY and MIN_HOME/AWAY.
"""

import os
import pandas as pd

RAW_FOLDER = "data/raw"
SAVE_PATH  = "data/processed/cleaned_games.csv"

SEASON_IDS = {"2022-23":22022, "2023-24":22023, "2024-25":22024}

def load_all_seasons():
    frames = []
    for season, sid in SEASON_IDS.items():
        f = f"{RAW_FOLDER}/games_{season}.csv"
        if os.path.exists(f):
            df = pd.read_csv(f)
            frames.append(df[df["SEASON_ID"]==sid])
    return pd.concat(frames, ignore_index=True)

def main():
    df = load_all_seasons().sort_values("GAME_DATE")
    df["IS_HOME"] = df["MATCHUP"].str.contains("vs").astype(int)

    # keep TEAM_ID + MIN so we can track injuries & travel later
    keep = ["GAME_ID","GAME_DATE","TEAM_ID","TEAM_NAME","WL","MIN",
            "PTS","FG_PCT","FG3_PCT","FT_PCT",
            "OREB","DREB","AST","STL","BLK","TOV","PF","PLUS_MINUS","IS_HOME"]

    home = df[df.IS_HOME==1][keep].rename(
        columns=lambda c: c if c in ["GAME_ID","GAME_DATE"] else c+"_HOME")
    away = df[df.IS_HOME==0][keep].rename(
        columns=lambda c: c if c in ["GAME_ID","GAME_DATE"] else c+"_AWAY")

    merged = pd.merge(home, away, on=["GAME_ID","GAME_DATE"])
    merged["HOME_WIN"] = (merged["WL_HOME"]=="W").astype(int)

    # derive REB columns
    merged["REB_HOME"]  = merged["OREB_HOME"] + merged["DREB_HOME"]
    merged["REB_AWAY"]  = merged["OREB_AWAY"] + merged["DREB_AWAY"]

    order = [
        "GAME_ID","GAME_DATE","TEAM_ID_HOME","TEAM_ID_AWAY","TEAM_NAME_HOME","TEAM_NAME_AWAY",
        "HOME_WIN",
        # core stats…
        "PTS_HOME","PTS_AWAY","FG_PCT_HOME","FG_PCT_AWAY","FG3_PCT_HOME","FG3_PCT_AWAY",
        "FT_PCT_HOME","FT_PCT_AWAY","OREB_HOME","OREB_AWAY","DREB_HOME","DREB_AWAY",
        "REB_HOME","REB_AWAY","AST_HOME","AST_AWAY","STL_HOME","STL_AWAY",
        "BLK_HOME","BLK_AWAY","TOV_HOME","TOV_AWAY","PF_HOME","PF_AWAY",
        "PLUS_MINUS_HOME","PLUS_MINUS_AWAY",
        # minutes (for injury proxy)
        "MIN_HOME","MIN_AWAY"
    ]
    merged = merged[order]

    os.makedirs("data/processed", exist_ok=True)
    merged.to_csv(SAVE_PATH, index=False)
    print("Saved →", SAVE_PATH, "with", len(merged), "rows")

if __name__ == "__main__":
    main()
