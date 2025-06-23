export interface GameOdds {
  game_id: number;
  game_date: string;      // ISO yyyy-mm-dd
  home_abbrev: string;
  away_abbrev: string;
  ml_home: number;
  ml_away: number;
  p_home: number;         // 0-1
  p_away: number;         // 0-1
}
