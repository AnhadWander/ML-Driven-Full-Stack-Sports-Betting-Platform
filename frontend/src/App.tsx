import { useEffect, useState } from "react";
import { fetchGameDays, fetchOdds } from "./api";
import OddsTable from "./components/OddsTable";   // ← path adjusted
import "./App.css";

export default function App() {
  const [days, setDays] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [odds, setOdds] = useState([]);

  useEffect(() => {
    fetchGameDays().then((d) => {
      setDays(d);
      if (d.length) setSelected(d[0]);
    });
  }, []);

  useEffect(() => {
    if (selected) fetchOdds(selected).then(setOdds);
  }, [selected]);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">NBA Model Odds</h1>

      <label className="block mb-2">
        <span className="mr-2">Select a game day:</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border px-2 py-1"
        >
          {days.map((d) => (
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
