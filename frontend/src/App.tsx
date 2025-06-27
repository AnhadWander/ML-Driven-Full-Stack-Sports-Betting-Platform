import { useEffect, useState } from "react";
import { fetchGameDays } from "./api";
import OddsTable from "./components/OddsTable";
import "./index.css";               // Tailwind directives live here

export default function App() {
  const [days, setDays]   = useState<string[]>([]);
  const [date, setDate]   = useState<string>("");
  const [loading, setLoading] = useState(false);

  // load game-days once
  useEffect(() => {
    fetchGameDays().then((d) => {
      setDays(d);
    setDate(d.includes("2024-01-15") ? "2024-01-15" : d[0]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 pb-16">
      <header className="py-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          NBA Model Odds
        </h1>
        <div className="mt-4">
          <label className="mr-2 font-medium">Select a game day:</label>
          <select
            className="rounded border px-2 py-1 shadow-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </header>

      {date && (
        <OddsTable
          date={date}
          onLoading={setLoading}
          className={loading ? "opacity-40 pointer-events-none" : ""}
        />
      )}
    </div>
  );
}
