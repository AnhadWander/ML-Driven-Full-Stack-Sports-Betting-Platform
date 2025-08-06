import { useNavigate, useParams } from "react-router-dom";
import OddsTable from "../components/OddsTable";
import NavBar from "../components/NavBar";

interface Props {
  days: string[];
}

export default function OddsDashboard({ days }: Props) {
  const { dt } = useParams();
  const nav = useNavigate();

  if (!dt || !days.includes(dt)) return null;

  return (
    <>
      <NavBar />


      <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eef2f7] to-[#e2e8f0] p-6">

        <section className="mx-auto mb-10 flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Odds for{" "}
            <span className="font-extrabold text-slate-900">{dt}</span>
          </h2>

          <select
            value={dt}
            onChange={(e) => nav(`/day/${e.target.value}`)}
            className="mt-2 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-400 focus:outline-none"
          >
            {days.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </section>

        <div className="mx-auto max-w-7xl">
          <OddsTable date={dt} />
        </div>
      </main>
    </>
  );
}