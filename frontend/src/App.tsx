import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { fetchGameDays } from "./api";
import Landing from "./pages/Landing";
import OddsDashboard from "./pages/OddsDashboard";
import Login from "./pages/Login";
import PropsPage from "./pages/PropsPage";
import Wallet from "./pages/Wallet";
import "./index.css";

export default function App() {
  const [days, setDays] = useState<string[]>([]);

  useEffect(() => {
    fetchGameDays().then(setDays);
  }, []);

  if (!days.length) return null;        // simple loader

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Landing days={days} />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/props"      element={<PropsPage />} />
        <Route path="/wallet"     element={<Wallet />} />
        <Route path="/day/:dt"    element={<OddsDashboard days={days} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
