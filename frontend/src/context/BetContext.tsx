import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

export type Bet = {
  id: string;
  date: string;
  homeAbbrev: string;
  awayAbbrev: string;
  stake: number;
};

type State = { bets: Bet[] };
type Action =
  | { type: "add"; bet: Bet }
  | { type: "clear" };

const BetCtx = createContext<State | null>(null);
const BetDispatchCtx = createContext<((a: Action) => void) | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return { bets: [...state.bets, action.bet] };
    case "clear":
      return { bets: [] };
    default:
      return state;
  }
}

export function BetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { bets: [] });
  return (
    <BetCtx.Provider value={state}>
      <BetDispatchCtx.Provider value={dispatch}>
        {children}
      </BetDispatchCtx.Provider>
    </BetCtx.Provider>
  );
}

/* ─────────── hooks ─────────── */

export function useBetStore() {
  const state    = useContext(BetCtx);
  const dispatch = useContext(BetDispatchCtx);
  if (!state || !dispatch) throw new Error("BetProvider missing");
  return {
    bets: state.bets,
    addBet: (bet: Bet) => dispatch({ type: "add", bet }),
    clear: () => dispatch({ type: "clear" }),
  };
}

/* alias for components that expect `useBets` */
export function useBets() {
  return useBetStore();
}
