import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "../components/NavBar";

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("jwt", token);
      nav("/wallet", { replace: true });
    }
  }, [params, nav]);

  const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google";

  return (
    <>
      <NavBar />

      {/* Background image lives in /frontend/public -> served at /NBATeamWallpaper.png */}
      <main
        className="grid h-[calc(100vh-64px)] place-items-center bg-black bg-cover bg-center bg-no-repeat px-6"
        style={{ backgroundImage: 'url(/NBATeamWallpaper.jpg)' }}
      >
        <div className="flex flex-col items-center gap-20">
          <h1 className="text-center text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="text-white">Login to </span>
            <span className="text-white">Hoop</span>
            <span className="text-yellow-300">Betz</span>
          </h1>

          <div className="w-full max-w-sm rounded-2xl bg-white p-10 shadow-xl ring-1 ring-black/10">
            <button
              onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
              className="relative mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 active:translate-y-px"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt=""
                className="h-5 w-5"
              />
              <span className="text-sm">Sign in with Google</span>
            </button>

            <div className="my-4 h-px w-full bg-slate-200" />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                nav("/wallet");
              }}
              className="space-y-4"
            >
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  required
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-black px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/20 active:translate-y-px"
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
