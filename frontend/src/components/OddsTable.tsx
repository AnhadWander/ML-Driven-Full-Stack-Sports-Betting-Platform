import type { GameOdds } from "../types";

type Props = {
  odds: GameOdds[];
};

export default function OddsTable({ odds }: Props) {
  if (!odds.length) return null;

  return (
    <div className="space-y-4">
      {odds.map((g) => {
        const homeLogo = `/logos/${g.home_abbrev}.png`;
        const awayLogo = `/logos/${g.away_abbrev}.png`;
        return (
          <div
            key={g.game_id}
            className="border rounded p-3 flex items-center space-x-4"
          >
            {/* Away */}
            <div className="flex flex-col items-center w-24">
              <img src={awayLogo} alt={g.away_abbrev} className="h-12" />
              <span className="text-sm">{g.away_abbrev}</span>
              <span className="text-xs text-gray-500">{g.ml_away}</span>
              <span className="text-xs">
                {(g.p_away * 100).toFixed(1)}%
              </span>
            </div>

            <div className="text-center grow">
              <p className="text-xs text-gray-400">{g.game_date}</p>
              <p className="font-semibold">vs</p>
            </div>

            {/* Home */}
            <div className="flex flex-col items-center w-24">
              <img src={homeLogo} alt={g.home_abbrev} className="h-12" />
              <span className="text-sm">{g.home_abbrev}</span>
              <span className="text-xs text-gray-500">{g.ml_home}</span>
              <span className="text-xs">
                {(g.p_home * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
