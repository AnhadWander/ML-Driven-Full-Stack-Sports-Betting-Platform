import { useEffect, useState } from "react";
import { fetchGameDays, fetchOdds } from "./api";
import type { GameOdds } from "./types";
import OddsTable from "./OddsTable";

export default function App() {
  const [dates, setDates] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [odds, setOdds] = useState<GameOdds[]>([]);

  // load list of game days once
  useEffect(() => {
    fetchGameDays().then((d) => {
      setDates(d);
      if (d.length) setSelected(d[d.length - 1]); // default = latest day
    });
  }, []);

  // load odds whenever date changes
  useEffect(() => {
    if (!selected) return;
    fetchOdds(selected).then(setOdds).catch(console.error);
  }, [selected]);

  return (
    <main style={{ maxWidth: 980, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>NBA Model Odds</h1>

      <label>
        Pick a date:&nbsp;
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">-- choose --</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <OddsTable odds={odds} />
    </main>
  );
}
