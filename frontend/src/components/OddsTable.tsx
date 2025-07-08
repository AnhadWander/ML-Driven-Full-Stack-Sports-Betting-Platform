import { useEffect, useState } from "react";
import type { GameOdds } from "../types";
import { fetchOdds } from "../api";
import BetModal from "./BetModal";

type Props = {
  date: string;
  onLoading?: (s: boolean) => void;
  className?: string;
};

export default function OddsTable({ date, onLoading, className }: Props) {
  const [games, setGames]     = useState<GameOdds[]>([]);
  const [open, setOpen]       = useState(false);
  const [chosen, setChosen]   = useState<GameOdds | null>(null);
  const [side, setSide]       = useState<"home" | "away" | null>(null); // ← NEW

  /* ────── refetch on date change ────── */
  useEffect(() => {
    setGames([]);
    onLoading?.(true);

    const ctrl = new AbortController();
    fetchOdds(date, { signal: ctrl.signal })
      .then(setGames)
      .catch((err) => err.name !== "AbortError" && console.error(err))
      .finally(() => onLoading?.(false));

    return () => ctrl.abort();
  }, [date]);

  /* ────── empty / loading state ────── */
  if (!games.length) {
    return (
      <p className="mt-8 text-lg text-gray-500 italic">
        {onLoading ? "Loading…" : `No games on ${date}`}
      </p>
    );
  }

  /* ────── render grid ────── */
  return (
    <>
      <section
        className={`mx-auto grid gap-8 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
      >
        {games.map((g) => (
          <article
            key={g.game_id}
            className="rounded-lg bg-white shadow transition hover:shadow-md"
          >
            {/* matchup header */}
            <div className="flex items-center justify-between p-4 sm:p-6">
              <TeamLogo abbrev={g.home_abbrev} className="mr-2" />
              <span className="font-semibold text-lg">vs</span>
              <TeamLogo abbrev={g.away_abbrev} className="ml-2" />
            </div>

            {/* odds */}
            <dl className="px-6 text-center text-sm sm:text-base">
              <div className="flex justify-center gap-1 font-mono">
                <dt className="sr-only">Money-Line</dt>
                <dd>{g.ml_home}</dd>
                <span>/</span>
                <dd>{g.ml_away}</dd>
              </div>

              <div className="flex justify-center gap-1">
                <dt className="sr-only">Win %</dt>
                <dd>{(g.p_home * 100).toFixed(1)}%</dd>
                <span>/</span>
                <dd>{(g.p_away * 100).toFixed(1)}%</dd>
              </div>

              <dd className="mt-1 text-xs text-gray-400">
                Game&nbsp;ID&nbsp;{g.game_id}
              </dd>
            </dl>

            {/* bet buttons */}
            <div className="mt-4 flex justify-center gap-4 pb-6">
              <button
                onClick={() => {
                  setChosen(g);
                  setSide("home");
                  setOpen(true);
                }}
                className="rounded bg-green-600 px-4 py-1 text-white hover:bg-green-700"
              >
                Bet&nbsp;{g.home_abbrev}
              </button>
              <button
                onClick={() => {
                  setChosen(g);
                  setSide("away");
                  setOpen(true);
                }}
                className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
              >
                Bet&nbsp;{g.away_abbrev}
              </button>
            </div>
          </article>
        ))}
      </section>

      {/* modal */}
      <BetModal
        open={open}
        onClose={() => setOpen(false)}
        game={chosen}
        side={side}
      />
    </>
  );
}

/* ───────── helper ───────── */

function TeamLogo({
  abbrev,
  className = "",
}: {
  abbrev: string;
  className?: string;
}) {
  return (
    <img
      src={`/logos/${abbrev}.png`}
      alt={abbrev}
      className={`h-24 w-24 object-contain ${className}`}
      onError={(e) => {
        const t = e.currentTarget;
        t.onerror = null;
        t.replaceWith(
          Object.assign(document.createElement("span"), {
            textContent: abbrev,
            className: "text-xl font-bold",
          })
        );
      }}
    />
  );
}
