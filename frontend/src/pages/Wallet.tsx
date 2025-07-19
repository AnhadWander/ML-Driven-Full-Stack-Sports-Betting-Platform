/* ───────── Wallet.tsx ───────── */
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import NavBar from "../components/NavBar";
import { v4 as uuid } from "uuid";
import { useBetStore } from "../context/BetContext";

type Tx = {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  dt: string; // ISO
};

export default function Wallet() {
  /* pull current bets and derive locked funds */
  const { bets }         = useBetStore();
  const lockedAmount     = bets.reduce((sum, b) => sum + b.stake, 0); // ← NEW

  const [balance, setBalance] = useState(1_000);
  const [txs, setTxs]         = useState<Tx[]>([]);

  /* modal state */
  const [open, setOpen]     = useState(false);
  const [mode, setMode]     = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState(50);

  /* helpers */
  const fmt   = (n: number) => `$${n.toLocaleString()}`;
  const addTx = (t: Tx) => setTxs((prev) => [t, ...prev.slice(0, 19)]);

  const doMove = () => {
    if (amount <= 0) return;

    const spendable = balance - lockedAmount;

    if (mode === "deposit") {
      setBalance((b) => b + amount);
      addTx({ id: uuid(), type: "deposit", amount, dt: new Date().toISOString() });
    } else {
      if (amount > spendable) {
        alert(
          `You have $${spendable.toLocaleString()} available — the rest is locked in open bets.`
        );
        return;
      }
      setBalance((b) => b - amount);
      addTx({ id: uuid(), type: "withdraw", amount, dt: new Date().toISOString() });
    }
    setOpen(false);
  };

  return (
    <>
      <NavBar />

      {/* background */}
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 p-6">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
          {/* ── balance card ── */}
          <section className="rounded-3xl bg-white/70 p-8 backdrop-blur shadow-md ring-1 ring-slate-200">
            <h2 className="mb-6 text-3xl font-extrabold text-slate-800">Wallet</h2>

            <div className="space-y-4">
              <Stat
                label="Available"
                value={fmt(balance - lockedAmount)}
                accent="text-indigo-600"
              />
              <Stat
                label="Locked (open bets)"
                value={fmt(lockedAmount)}
                accent="text-amber-600"
              />
              <div className="h-px w-full bg-slate-200" />
              <Stat
                label="Total Bankroll"
                value={fmt(balance)}
                accent="text-emerald-600"
              />
            </div>

            {/* quick actions */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { label: "+$50",  m: "deposit",  amt: 50 },
                { label: "+$100", m: "deposit",  amt: 100 },
                { label: "−$50",  m: "withdraw", amt: 50 },
                { label: "−$100", m: "withdraw", amt: 100 },
              ].map((b) => (
                <button
                  key={b.label}
                  onClick={() => {
                    setMode(b.m as "deposit" | "withdraw");
                    setAmount(b.amt);
                    doMove();
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white
                    ${
                      b.m === "deposit"
                        ? "bg-indigo-500 hover:bg-indigo-600"
                        : "bg-rose-500 hover:bg-rose-600"
                    }`}
                >
                  {b.label}
                </button>
              ))}

              <button
                onClick={() => {
                  setMode("deposit");
                  setAmount(50);
                  setOpen(true);
                }}
                className="ml-auto rounded-lg border border-slate-300 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur hover:bg-slate-50"
              >
                Custom&nbsp;Amount
              </button>
            </div>
          </section>

          {/* ── tx history ── */}
          <section className="rounded-3xl bg-white/70 p-8 backdrop-blur shadow-md ring-1 ring-slate-200">
            <h3 className="mb-6 text-xl font-bold text-slate-800">
              Recent&nbsp;Transactions
            </h3>

            {txs.length === 0 ? (
              <p className="text-sm text-slate-500">No transactions yet.</p>
            ) : (
              <ul className="space-y-4 text-sm">
                {txs.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-xl bg-white/50 px-4 py-3 ring-1 ring-slate-100"
                  >
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-0.5 text-xs font-semibold
                        ${
                          t.type === "deposit"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                    >
                      {t.type === "deposit" ? "Deposit" : "Withdraw"}
                    </span>
                    <span className="font-mono">{fmt(t.amount)}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(t.dt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>

      {/* ───── modal ───── */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 grid place-content-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <Dialog.Title className="mb-4 text-lg font-bold text-slate-800">
                  {mode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
                </Dialog.Title>

                <label className="block text-xs font-medium text-slate-600">
                  Amount&nbsp;($)
                </label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500"
                />

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={doMove}
                    className={`rounded px-4 py-2 text-sm font-semibold text-white
                      ${
                        mode === "deposit"
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                  >
                    {mode === "deposit" ? "Deposit" : "Withdraw"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

/* util component */
function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`text-2xl font-black tracking-tight ${accent ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
