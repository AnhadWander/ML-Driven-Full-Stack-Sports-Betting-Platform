import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { fetchGameDays } from "./api";

import Landing        from "./pages/Landing";
import OddsDashboard  from "./pages/OddsDashboard";
import Login          from "./pages/Login";
import PropsPage      from "./pages/PropsPage";
import Wallet         from "./pages/Wallet";
import MyBets         from "./pages/MyBets";      /* ⬅️ added */
import "./index.css";

export default function App() {
  const [days, setDays] = useState<string[]>([]);

  /* fetch once at mount */
  useEffect(() => {
    fetchGameDays().then(setDays);
  }, []);

  if (!days.length) return null;   /* simple loader while fetching */

  /* all routing now lives here */
  return (
    <Routes>
      <Route path="/"            element={<Landing days={days} />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/props"       element={<PropsPage />} />
      <Route path="/wallet"      element={<Wallet />} />
      <Route path="/my-bets"     element={<MyBets />} />   {/* ⬅️ new */}
      <Route path="/day/:dt"     element={<OddsDashboard days={days} />} />
      <Route path="*"            element={<Navigate to="/" />} />
    </Routes>
  );
}
