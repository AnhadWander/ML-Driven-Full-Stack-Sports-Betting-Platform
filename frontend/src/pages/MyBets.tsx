import { useBetStore } from "../context/BetContext";

export default function MyBets() {
  const { bets } = useBetStore();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-3xl font-extrabold mb-6">My Bets</h2>
      {bets.length === 0 ? (
        <p className="text-gray-500">No bets yet – go place one!</p>
      ) : (
        <table className="w-full text-sm border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-gray-500">
              <th>Date</th>
              <th>Matchup</th>
              <th className="text-right">Stake</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((b) => (
              <tr key={b.id} className="bg-white rounded shadow">
                <td className="px-4 py-2">{b.date}</td>
                <td className="px-4 py-2">
                  {b.homeAbbrev} vs {b.awayAbbrev}
                </td>
                <td className="px-4 py-2 text-right">${b.stake}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}