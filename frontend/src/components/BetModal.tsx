import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { v4 as uuid } from "uuid";

import type { GameOdds } from "../types";
import { useBets } from "../context/BetContext";

type Props = {
  open: boolean;
  onClose: () => void;
  game: GameOdds | null;
  side: "home" | "away" | null;
  selectedDate: string;
};

export default function BetModal({
  open,
  onClose,
  game,
  side,
  selectedDate,
}: Props) {
  const { addBet } = useBets();
  const [stake, setStake] = useState(10);

  if (!open || !game || !side) return null;

  const abbrev = side === "home" ? game.home_abbrev : game.away_abbrev;
  const odds   = side === "home" ? game.ml_home     : game.ml_away;

  const profit  = odds > 0 ? (stake *  odds) / 100
                           : (stake * 100) / Math.abs(odds);
  const payout  = stake + profit;

  const submit = () => {
    addBet({
      id: uuid(),
      date:        selectedDate,
      homeAbbrev:  game.home_abbrev,
      awayAbbrev:  game.away_abbrev,
      stake,
      team: abbrev,   
      odds,           
    } as any);        
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 grid place-content-center p-4">
        <Dialog.Panel className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-xl font-bold">
            Bet on {abbrev}
          </Dialog.Title>

          <p className="mb-2 text-gray-600">
            Money-line&nbsp;odds:&nbsp;
            <span className="font-mono">{odds}</span>
          </p>

          <p className="mb-6 text-sm text-emerald-700">
            Potential&nbsp;return:&nbsp;
            <span className="font-semibold">${payout.toFixed(2)}</span>
          </p>

          <label className="block mb-6">
            <span className="text-sm font-medium text-gray-700">
              Stake&nbsp;($)
            </span>
            <input
              type="number"
              min={1}
              value={stake}
              onChange={(e) => setStake(+e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Confirm&nbsp;Bet
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
