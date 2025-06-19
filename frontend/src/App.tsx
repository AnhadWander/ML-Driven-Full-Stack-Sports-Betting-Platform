import { useEffect, useState } from "react";
import { fetchGameDays, fetchOdds } from "./api";
import type { GameOdds }          from "./api";   // 👈 type-only import

export default function App() {
  // ── state ──────────────────────────────────────────────────────────────
  const [dates,     setDates]   = useState<string[]>([]);
  const [selected,  setSel]     = useState<string>("");
  const [odds,      setOdds]    = useState<GameOdds[]>([]);
  const [loadingD,  setLD]      = useState(false);
  const [loadingO,  setLO]      = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  // ── load game-day list once ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setLD(true);
        const d = await fetchGameDays();
        setDates(d);
        if (d.length) setSel(d[0]);          // pick first by default
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLD(false);
      }
    })();
  }, []);

  // ── whenever `selected` changes, load odds ─────────────────────────────
  useEffect(() => {
    if (!selected) return;
    (async () => {
      try {
        setLO(true);
        setError(null);
        setOdds(await fetchOdds(selected));
      } catch (err: any) {
        setError(err.message);
        setOdds([]);
      } finally {
        setLO(false);
      }
    })();
  }, [selected]);

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        NBA Model Odds (offline test)
      </h1>

      {/* date selector */}
      {loadingD ? (
        <p>Loading game days…</p>
      ) : (
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Pick Date:&nbsp;
          <select
            value={selected}
            onChange={(e) => setSel(e.target.value)}
            style={{ border: "1px solid #ccc", padding: "0.25rem 0.5rem" }}
          >
            {dates.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
      )}

      {/* error */}
      {error && (
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {/* odds table */}
      {loadingO ? (
        <p>Loading odds…</p>
      ) : odds.length === 0 ? (
        <p>No games for this day.</p>
      ) : (
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ background: "#f3f3f3" }}>
              <th style={th}>Home</th>
              <th style={th}>Away</th>
              <th style={th}>ML (Home)</th>
              <th style={th}>ML (Away)</th>
            </tr>
          </thead>
          <tbody>
            {odds.map((g) => (
              <tr key={g.GAME_ID}>
                <td style={td}>{g.HOME_ABBREV}</td>
                <td style={td}>{g.AWAY_ABBREV}</td>
                <td style={tdCenter}>{g.ML_HOME}</td>
                <td style={tdCenter}>{g.ML_AWAY}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th = { border: "1px solid #ccc", padding: "0.25rem 0.5rem", textAlign: "left" };
const td = { ...th, fontWeight: 400 };
const tdCenter = { ...td, textAlign: "center" };
