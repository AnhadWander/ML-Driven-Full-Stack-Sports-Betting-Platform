// src/types.ts
export interface GameOdds {
  game_id: number;
  game_date: string;   // ISO YYYY-MM-DD
  home_abbrev: string;
  away_abbrev: string;
  ml_home: number;
  ml_away: number;
  p_home: number;
  p_away: number;
}

/** Keeps the module alive at runtime (0-byte tree-shaken in prod) */
export const __noop = 0;
