import { Link, NavLink } from "react-router-dom";

const tabs = [
  { to: "/day/2024-01-12", label: "OddzBoard" }, // ← new link
  { to: "/props",          label: "My Betz" },
  { to: "/wallet",         label: "My Wallet" },
];

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-black text-white drop-shadow">
          Hoop<span className="text-yellow-300">Betz</span>
        </Link>

        <div className="flex items-center gap-6">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                (isActive ? "text-white" : "text-orange-100") +
                " font-semibold hover:text-yellow-200"
              }
            >
              {t.label}
            </NavLink>
          ))}
          <Link
            to="/login"
            className="rounded-lg bg-white/10 px-3 py-1.5 font-semibold text-white backdrop-blur hover:bg-white/20"
          >
            Log&nbsp;in
          </Link>
        </div>
      </div>
    </nav>
  );
}
