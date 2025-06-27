import { useEffect, useState } from "react";
import type { GameOdds } from "../types";
import { fetchOdds } from "../api";

type Props = {
  date: string;
  onLoading?: (s: boolean) => void;
  className?: string;
};

export default function OddsTable({ date, onLoading, className }: Props) {
  const [games, setGames] = useState<GameOdds[]>([]);

  useEffect(() => {
    // ① reset immediately so old data disappears
    setGames([]);
    onLoading?.(true);

    // ② abort controller prevents “stale” results
    const ctrl = new AbortController();

    fetchOdds(date, { signal: ctrl.signal })
      .then((data) => setGames(data))
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      })
      .finally(() => onLoading?.(false));

    // ③ cancel fetch if the date changes again *before* it finishes
    return () => ctrl.abort();
  }, [date]);

  if (!games.length) {
    // While loading we want an empty spot → keeps layout calm
    return (
      <p className="mt-8 text-lg text-gray-500 italic">
        {onLoading ? "Loading…" : `No games on ${date}`}
      </p>
    );
  }

  return (
    <section
      className={`mx-auto grid gap-8 sm:grid-cols-2 xl:grid-cols-3 ${className}`}
    >
      {games.map((g) => (
        <article
          key={g.game_id}
          className="rounded-lg bg-white shadow transition hover:shadow-md"
        >
          <div className="flex items-center justify-between p-4 sm:p-6">
            <TeamLogo abbrev={g.home_abbrev} className="mr-2" />
            <span className="font-semibold text-lg">vs</span>
            <TeamLogo abbrev={g.away_abbrev} className="ml-2" />
          </div>

          <dl className="px-6 pb-6 text-center text-sm sm:text-base">
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

            <dd className="mt-1 text-xs text-gray-400">Game ID {g.game_id}</dd>
          </dl>
        </article>
      ))}
    </section>
  );
}

/* ────────────────── helper ────────────────── */

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
