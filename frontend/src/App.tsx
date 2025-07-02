// --- existing imports ---
import { useEffect, useState } from "react";
import { fetchGameDays } from "./api";
import OddsTable from "./components/OddsTable";
import "./index.css";

// + NEW ↓
import { BrowserRouter, Routes, Route, useNavigate, useParams } from "react-router-dom";

// ⬇️  keep the fetching logic just as it is
export default function App() {
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    fetchGameDays().then(setDays);
  }, []);

  if (!days.length) return null;       // (simple loading guard)

  /* ----------------------------------------------------------- *
   *  Two pages: `/`  (date-picker)       and     `/day/:date`
   * ----------------------------------------------------------- */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<DateSelectPage days={days} />} />
        <Route path="/day/:dt" element={<OddsPage      days={days} />} />
        {/* optional 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ---------------------------------------------------------------------- */
/*  Page 1 – date picker                                                  */
/* ---------------------------------------------------------------------- */
function DateSelectPage({ days }: { days: string[] }) {
  const [picked, setPicked] = useState("2024-01-20");   // default choice
  const nav = useNavigate();

  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-extrabold">
          NBA Model Odds
        </h1>

        <label className="block text-sm font-medium text-gray-700">
          Select a historical game day
        </label>

        <select
          className="mt-2 w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
        >
          {days.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <button
          onClick={() => nav(`/day/${picked}`)}
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 active:scale-95"
        >
          View odds
        </button>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------------- */
/*  Page 2 – odds dashboard                                               */
/* ---------------------------------------------------------------------- */
function OddsPage({ days }: { days: string[] }) {
  const { dt } = useParams();
  const nav     = useNavigate();

  // guard against bad URL
  if (!dt || !days.includes(dt)) {
    return <NotFound back={() => nav("/")} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* top nav / changer */}
      <header className="mx-auto mb-8 flex max-w-7xl flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold">NBA Model Odds</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Game day:</label>
          <select
            value={dt}
            onChange={(e) => nav(`/day/${e.target.value}`)}
            className="rounded-md border px-2 py-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
      </header>

      {/* odds grid */}
      <OddsTable date={dt} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  fallback                                                               */
/* ---------------------------------------------------------------------- */
function NotFound({ back }: { back?: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 p-4">
      <div className="text-center">
        <h2 className="text-4xl font-bold">404</h2>
        <p className="mt-2">Page not found.</p>
        {back && (
          <button
            onClick={back}
            className="mt-4 rounded bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            Return home
          </button>
        )}
      </div>
    </main>
  );
}
