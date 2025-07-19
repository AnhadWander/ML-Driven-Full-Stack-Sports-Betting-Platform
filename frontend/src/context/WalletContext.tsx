import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";

export type Txn = {
  id: string;          // uuid
  ts: string;          // ISO timestamp
  note: string;
  delta: number;       // +credit, –debit
};

type State   = { txns: Txn[] };
type Action =
  | { type: "add";  txn: Txn }
  | { type: "clear" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return { txns: [action.txn, ...state.txns] };
    case "clear":
      return { txns: [] };
    default:
      return state;
  }
}

const CtxState    = createContext<State | null>(null);
const CtxDispatch = createContext<((a: Action) => void) | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () =>
      JSON.parse(localStorage.getItem("wallet") || `{"txns":[]}`) as State
  );

  /* persist to localStorage whenever it changes */
  useEffect(() => {
    localStorage.setItem("wallet", JSON.stringify(state));
  }, [state]);

  return (
    <CtxState.Provider value={state}>
      <CtxDispatch.Provider value={dispatch}>
        {children}
      </CtxDispatch.Provider>
    </CtxState.Provider>
  );
}

/* ─────────── hooks ─────────── */

export function useWallet() {
  const s = useContext(CtxState);
  if (!s) throw new Error("WalletProvider missing");
  const balance = s.txns.reduce((sum, t) => sum + t.delta, 0);
  return { txns: s.txns, balance };      // ← now exposes `balance`
}

export function useWalletActions() {
  const d = useContext(CtxDispatch);
  if (!d) throw new Error("WalletProvider missing");
  return {
    add:  (txn: Txn) => d({ type: "add",  txn }),
    clear:()         => d({ type: "clear" }),
  };
}
