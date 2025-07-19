import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "../components/NavBar";

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  /* ───────── handle Google callback (token in URL) ───────── */
  useEffect(() => {
    const token = params.get("token");
    if (token) {
      // ✅ token arrived from backend → store & proceed
      localStorage.setItem("jwt", token);
      nav("/wallet", { replace: true });
    }
  }, [params, nav]);

  /* ───────── helpers ───────── */
  const GOOGLE_AUTH_URL = "http://localhost:8000/auth/google";

  return (
    <>
      <NavBar />
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-400 p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur">
          {/* logo / title */}
          <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
            Welcome&nbsp;to&nbsp;HoopBetz
          </h2>

          {/* Google button */}
          <button
            onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
            className="relative flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-2 font-medium shadow-sm transition hover:bg-gray-50 active:scale-95"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt=""
              className="h-5 w-5"
            />
            <span className="text-sm text-gray-700">Sign&nbsp;in&nbsp;with&nbsp;Google</span>
          </button>

          {/* divider */}
          <div className="my-6 flex items-center">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="mx-3 text-xs uppercase tracking-wider text-gray-400">
              or
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* classic form (optional fallback) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              nav("/wallet");
            }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                required
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Password
              <input
                type="password"
                required
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
            >
              Sign&nbsp;in
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
