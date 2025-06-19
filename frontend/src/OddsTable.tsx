import type { GameOdds } from "./types";

interface Props {
  odds: GameOdds[];
}

export default function OddsTable({ odds }: Props) {
  if (!odds.length) return null;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
      <thead>
        <tr>
          <th>Date</th>
          <th>Away</th>
          <th>Home</th>
          <th>ML Away</th>
          <th>ML Home</th>
          <th>P Away</th>
          <th>P Home</th>
        </tr>
      </thead>
      <tbody>
        {odds.map((g) => (
          <tr key={g.game_id}>
            <td>{g.game_date}</td>
            <td>{g.away_abbrev}</td>
            <td>{g.home_abbrev}</td>
            <td>{g.ml_away}</td>
            <td>{g.ml_home}</td>
            <td>{(g.p_away * 100).toFixed(1)}%</td>
            <td>{(g.p_home * 100).toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
