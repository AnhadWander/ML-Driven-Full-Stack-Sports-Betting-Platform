import { useState } from "react";
import NavBar from "../components/NavBar";

export default function Wallet() {
  const [balance, setBalance] = useState(1_000);

  return (
    <>
      <NavBar />
      <main className="grid min-h-screen place-items-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-center text-3xl font-extrabold">
            My Wallet
          </h2>
          <p className="mb-6 text-center text-lg">
            Current bankroll:
            <span className="ml-2 text-4xl font-black text-indigo-600">
              ${balance.toLocaleString()}
            </span>
          </p>

          <button
            onClick={() => setBalance((b) => b + 100)}
            className="mb-3 w-full rounded-lg bg-emerald-500 py-2 font-semibold text-white hover:bg-emerald-600 active:scale-95"
          >
            + $100 (faucet)
          </button>

          <button
            onClick={() => setBalance((b) => Math.max(0, b - 100))}
            className="w-full rounded-lg bg-rose-500 py-2 font-semibold text-white hover:bg-rose-600 active:scale-95"
          >
            – $100
          </button>
        </div>
      </main>
    </>
  );
}
