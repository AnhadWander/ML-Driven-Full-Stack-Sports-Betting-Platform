import axios from "axios";
import type { GameOdds } from "./types";

const API_ROOT = "http://127.0.0.1:8000/api";

export async function fetchGameDays(): Promise<string[]> {
  const res = await axios.get<string[]>(`${API_ROOT}/game-days`);
  return res.data;
}

export async function fetchOdds(date: string): Promise<GameOdds[]> {
  const res = await axios.get<GameOdds[]>(`${API_ROOT}/odds`, {
    params: { date },
  });
  return res.data;
}
