import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function Login() {
  const nav = useNavigate();
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    /* ✨  TODO: real auth – here we just redirect  */
    nav("/wallet");
  }

  return (
    <>
      <NavBar />
      <main className="grid min-h-screen place-items-center bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl bg-white/90 p-8 shadow-lg backdrop-blur"
        >
          <h2 className="mb-6 text-center text-2xl font-extrabold text-gray-900">
            Log in
          </h2>

          <label className="block text-sm font-medium">Username</label>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mb-4 mt-1 w-full rounded border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="mb-6 mt-1 w-full rounded border px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500"
            required
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 active:scale-95"
          >
            Sign in
          </button>
        </form>
      </main>
    </>
  );
}
