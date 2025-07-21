import axios from "axios";
import type { GameOdds } from "./types";

const API_ROOT = "http://127.0.0.1:8000/api";

export async function fetchOdds(
  date: string,
  axiosOpts: Parameters<typeof axios.get>[1] = {}
): Promise<GameOdds[]> {
  const res = await axios.get(`${API_ROOT}/odds`, {
    params: { date },
    ...axiosOpts,         
  });
  return res.data;
}

export async function fetchGameDays(): Promise<string[]> {
  const res = await axios.get(`${API_ROOT}/game-days`);
  return res.data;
}
