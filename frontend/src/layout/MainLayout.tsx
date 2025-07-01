import { NavLink, Outlet } from "react-router-dom";
import { FaBasketballBall } from "react-icons/fa";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      {/* ---- nav bar ---- */}
      <nav className="sticky top-0 z-20 flex items-center justify-between bg-indigo-600 px-6 py-3 text-white shadow-lg">
        <div className="flex items-center gap-2 text-2xl font-extrabold">
          <FaBasketballBall className="animate-bounce" /> HoopBetz
        </div>
        <div className="flex gap-4 font-medium">
          <NavLink to="/"        className="hover:text-orange-300">Home</NavLink>
          <NavLink to="/info"    className="hover:text-orange-300">Info</NavLink>
          <NavLink to="/stats"   className="hover:text-orange-300">Stats</NavLink>
          <NavLink to="/wallet"  className="hover:text-orange-300">Wallet</NavLink>
          <NavLink to="/login"   className="rounded bg-white/20 px-3 py-1 hover:bg-white/40">Login</NavLink>
        </div>
      </nav>

      {/* where pages render */}
      <Outlet />
    </div>
  );
}
