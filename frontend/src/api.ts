// ---------------------------------------------------------------------------
// Simple wrapper around the FastAPI back-end
// ---------------------------------------------------------------------------
export interface GameOdds {
  GAME_ID:     number;
  GAME_DATE:   string;   // ISO yyyy-mm-dd
  HOME_ABBREV: string;
  AWAY_ABBREV: string;
  ML_HOME:     number;
  ML_AWAY:     number;
  P_HOME:      number;
  P_AWAY:      number;
}

/** GET /api/game-days → ["2024-04-12", "2024-04-13", ...] */
export async function fetchGameDays(): Promise<string[]> {
  const r = await fetch("http://127.0.0.1:8000/api/game-days");
  if (!r.ok) throw new Error("Failed to load game days");
  return r.json();
}

/** GET /api/odds?date=YYYY-MM-DD → GameOdds[] */
export async function fetchOdds(date: string): Promise<GameOdds[]> {
  const url = `http://127.0.0.1:8000/api/odds?date=${encodeURIComponent(date)}`;
  const r   = await fetch(url);
  if (!r.ok) throw new Error("Failed to load odds");
  return r.json();
}
