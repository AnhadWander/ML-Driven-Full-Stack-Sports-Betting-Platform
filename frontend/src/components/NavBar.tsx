// src/components/NavBar.tsx
import { Link, NavLink } from "react-router-dom";

const tabs = [
  { to: "/day/2024-01-12", label: "OddzBoard" },
  { to: "/props",          label: "My Betz" },
  { to: "/wallet",         label: "My Wallet" },
];

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-white/10 ring-1 ring-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="select-none text-3xl md:text-4xl font-black leading-none tracking-tight"
        >
          <span className="text-white">Hoop</span>
          <span className="text-yellow-300">Betz</span>
        </Link>

        <div className="flex items-center gap-6">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  "font-semibold transition-colors",
                  isActive ? "text-white" : "text-slate-300 hover:text-white",
                ].join(" ")
              }
            >
              {t.label}
            </NavLink>
          ))}

          <Link
            to="/login"
            className="rounded-lg bg-yellow-300 px-3 py-1.5 font-semibold text-black shadow-sm ring-1 ring-black/10 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
          >
            Log&nbsp;in
          </Link>
        </div>
      </div>
    </nav>
  );
}
