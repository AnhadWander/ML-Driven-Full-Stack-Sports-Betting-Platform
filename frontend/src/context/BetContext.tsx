import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from "react";

/* ─────────── types ─────────── */

export type Bet = {
  id: string;
  date: string;
  homeAbbrev: string;
  awayAbbrev: string;
  stake: number;
  /* extras other pages might need */
  gameId?: number | string;
  team?: string;          // team the user picked
  odds?: number;
};

type State = { bets: Bet[] };

type Action =
  | { type: "add";    bet: Bet }
  | { type: "update"; id: string; stake: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

/* ─────────── reducer ─────────── */

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":
      return { bets: [...state.bets, action.bet] };

    case "update":
      return {
        bets: state.bets.map((b) =>
          b.id === action.id ? { ...b, stake: action.stake } : b
        ),
      };

    case "remove":
      return { bets: state.bets.filter((b) => b.id !== action.id) };

    case "clear":
      return { bets: [] };

    default:
      return state;
  }
}

/* ─────────── contexts ─────────── */

const BetCtx         = createContext<State | null>(null);
const BetDispatchCtx = createContext<((a: Action) => void) | null>(null);

/* ─────────── provider ─────────── */

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
    /** list of current bets */
    bets: state.bets,

    /** aggregate helpers */
    lockedAmount: state.bets.reduce((sum, b) => sum + b.stake, 0),

    /** CRUD actions */
    addBet: (bet: Bet)          => dispatch({ type: "add", bet }),
    updateBet: (id: string, s: number) =>
      dispatch({ type: "update", id, stake: s }),
    removeBet: (id: string)     => dispatch({ type: "remove", id }),
    clear: ()                   => dispatch({ type: "clear" }),
  };
}

/* legacy alias for older components */
export const useBets = useBetStore;
