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
  /* optional extras that other pages might show */
  gameId?: number | string;
  team?: string;           // side the user picked
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

const BetCtx          = createContext<State | null>(null);
const BetDispatchCtx  = createContext<((a: Action) => void) | null>(null);

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
    /** array of current bets */
    bets: state.bets,

    /** add a new bet */
    addBet: (bet: Bet) => dispatch({ type: "add", bet }),

    /** change only the stake of a bet */
    updateBet: (id: string, stake: number) =>
      dispatch({ type: "update", id, stake }),

    /** remove a bet completely */
    removeBet: (id: string) => dispatch({ type: "remove", id }),

    /** wipe all bets */
    clear: () => dispatch({ type: "clear" }),
  };
}

/* 〰️ legacy alias — keeps older components happy */
export const useBets = useBetStore;
