import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  days: string[];
}

export default function Landing({ days }: Props) {
  const [picked, setPicked] = useState("2024-01-12");
  const nav = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: 'url("/hero-hoopbetz.jpg")' }}
    >
      <div className="min-h-screen bg-black/60 backdrop-blur-sm flex flex-col justify-between">
        <header className="mx-auto flex max-w-6xl flex-col items-center pt-24 text-center">
          <h1 className="text-7xl font-extrabold tracking-tight drop-shadow-lg">
            Welcome&nbsp;to&nbsp;<span className="text-yellow-300">HoopBetz</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-gray-200">
            Bet on real NBA history using elite odds powered by HoopBetz’s proprietary machine learning engine — sharper than anything else out there.
          </p>
          <h2 className="mt-10 text-4xl font-extrabold tracking-tight drop-shadow-lg"><b>Pick a Day.</b></h2>
          <h2 className="mt-10 text-4xl font-extrabold tracking-tight drop-shadow-lg"><b>Make your Move.</b></h2>

          <div className="mt-20 flex flex-col items-center gap-4 sm:flex-row">
            <select
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
              className="rounded-lg border border-white/30 bg-white/20 px-3 py-2 text-lg font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <button
              onClick={() => nav(`/day/${picked}`)}
              className="rounded-lg bg-yellow-300 px-6 py-2 text-lg font-bold text-gray-900 shadow hover:bg-yellow-200 active:scale-95"
            >
              Enter Sportsbook
            </button>
          </div>
        </header>

        {/* Quote footer */}
        <footer className="pb-10 text-center text-lg text-gray-300 font-medium italic drop-shadow-md">
          “You miss 100% of the shots you don’t take.” — Wayne Gretzky
        </footer>
      </div>
    </div>
  );
}
