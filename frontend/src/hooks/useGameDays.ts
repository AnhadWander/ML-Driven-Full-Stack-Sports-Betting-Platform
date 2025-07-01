import { useEffect, useState } from "react";
import { fetchGameDays } from "../api";

export function useGameDays() {
  const [days, setDays] = useState<string[]>([]);
  useEffect(() => { fetchGameDays().then(setDays); }, []);
  return days;
}
