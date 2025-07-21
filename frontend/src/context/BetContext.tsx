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
  gameId?: number | string;
  team?: string;          
  odds?: number;
};

type State = { bets: Bet[] };

type Action =
  | { type: "add";    bet: Bet }
  | { type: "update"; id: string; stake: number }
  | { type: "remove"; id: string }
  | { type: "clear" };


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


const BetCtx         = createContext<State | null>(null);
const BetDispatchCtx = createContext<((a: Action) => void) | null>(null);


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


export function useBetStore() {
  const state    = useContext(BetCtx);
  const dispatch = useContext(BetDispatchCtx);
  if (!state || !dispatch) throw new Error("BetProvider missing");

  return {
    bets: state.bets,

    lockedAmount: state.bets.reduce((sum, b) => sum + b.stake, 0),

    addBet: (bet: Bet)          => dispatch({ type: "add", bet }),
    updateBet: (id: string, s: number) =>
      dispatch({ type: "update", id, stake: s }),
    removeBet: (id: string)     => dispatch({ type: "remove", id }),
    clear: ()                   => dispatch({ type: "clear" }),
  };
}

export const useBets = useBetStore;
