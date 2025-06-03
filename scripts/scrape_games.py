from nba_api.stats.endpoints import leaguegamefinder
import pandas as pd
import os

SEASONS = ['2022-23', '2023-24', '2024-25']

def fetch_games_for_season(season):
    gamefinder = leaguegamefinder.LeagueGameFinder(season_nullable=season, league_id_nullable='00')
    games = gamefinder.get_data_frames()[0]

    os.makedirs('data/raw', exist_ok=True)
    file_path = f"data/raw/games_{season}.csv"
    games.to_csv(file_path, index=False)
    print(f"Saved {len(games)} games for {season} to {file_path}")

if __name__ == "__main__":
    for season in SEASONS:
        fetch_games_for_season(season)
