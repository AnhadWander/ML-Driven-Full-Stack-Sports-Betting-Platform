import axios from "axios";
import type { GameOdds } from "./types";   // 👈  type-only import

const API_ROOT = "http://127.0.0.1:8000/api";

export async function fetchGameDays(): Promise<string[]> {
  const { data } = await axios.get<string[]>(`${API_ROOT}/game-days`);
  return data;
}

export async function fetchOdds(date: string): Promise<GameOdds[]> {
  const { data } = await axios.get<GameOdds[]>(`${API_ROOT}/odds`, {
    params: { date },
  });
  return data;
}
