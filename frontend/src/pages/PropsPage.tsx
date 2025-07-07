import NavBar from "../components/NavBar";

export default function PropsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-4 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white/10 p-10 backdrop-blur">
          <h2 className="mb-6 text-3xl font-extrabold drop-shadow">
            Player / Team Props (Coming&nbsp;Soon)
          </h2>
          <p>
            This page will let you bet on points, rebounds, parlays, and more.
            Hook it up to the same FastAPI backend the way we did for money-line
            odds.
          </p>
        </div>
      </main>
    </>
  );
}
