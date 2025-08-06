import type { GameOdds } from "../types";

interface Props {
  game: GameOdds;
}

function Team({
  abbrev,
  side,
}: {
  abbrev: string;
  side: "home" | "away";
}) {
  return (
    <div className="flex flex-col items-center gap-1 w-28">
      <img
        src={`/logos/${abbrev}.png`}
        alt={abbrev}
        className="w-16 h-16 object-contain"
      />
      <span
        className={`font-semibold uppercase ${
          side === "home" ? "text-indigo-700" : "text-rose-700"
        }`}
      >
        {abbrev}
      </span>
    </div>
  );
}

export default function GameCard({ game }: Props) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow rounded-xl p-4 flex items-center justify-between gap-4">
      <Team abbrev={game.away_abbrev} side="away" />

      <div className="flex flex-col items-center text-sm">
        <span className="text-gray-500 mb-1">{game.game_date}</span>

        <table className="text-center">
          <tbody>
            <tr>
              <td className="pr-2 text-gray-600">ML</td>
              <td className="px-2 text-rose-600">{game.ml_away}</td>
              <td className="pl-2 text-indigo-600">{game.ml_home}</td>
            </tr>
            <tr>
              <td className="pr-2 text-gray-600">Win%</td>
              <td className="px-2 text-rose-600">
                {(game.p_away * 100).toFixed(1)}%
              </td>
              <td className="pl-2 text-indigo-600">
                {(game.p_home * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Team abbrev={game.home_abbrev} side="home" />
    </div>
  );
}