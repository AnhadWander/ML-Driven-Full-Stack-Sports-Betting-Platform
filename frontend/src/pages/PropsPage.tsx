import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useBetStore } from "../context/BetContext";
import NavBar from "../components/NavBar";


const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

function calcReturn(stake: number, odds: number) {
  if (!odds) return 0;
  return odds > 0
    ? stake + stake * (odds / 100)
    : stake + stake * (100 / Math.abs(odds));
}


export default function PropsPage() {
  const { bets, updateBet, removeBet } = useBetStore();

  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [selected, setSelected] = useState<typeof bets[number] | null>(null);

  const openEdit = (b: typeof bets[number]) => {
    setSelected({ ...b });
    setEditOpen(true);
  };
  const openDelete = (b: typeof bets[number]) => {
    setSelected(b);
    setDelOpen(true);
  };

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,theme(colors.slate.50)_0%,theme(colors.slate.100)_40%,theme(colors.slate.200)_100%)] px-4 pt-6 pb-16">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="mt-2 mb-5 text-3xl font-extrabold text-slate-800">
            My&nbsp;Bets
          </h1>
          {bets.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white/60 p-10 text-center text-lg font-medium text-slate-500 backdrop-blur-md">
              You haven’t placed any bets yet&nbsp;— time to hit the odds page!
            </p>
          ) : (
            <ul
              role="list"
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {bets.map((b) => (
                <li
                  key={b.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-indigo-100/70 bg-white/40 shadow-sm backdrop-blur-md hover:shadow-lg"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-indigo-400/40" />

                  <div className="flex-1 space-y-4 p-6">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {fmtDate(b.date)}
                    </p>

                    <h2 className="text-lg font-bold text-slate-900">
                      {b.homeAbbrev}{" "}
                      <span className="text-slate-400">vs</span>{" "}
                      {b.awayAbbrev}
                    </h2>

                    {b.team && (
                      <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold leading-none text-indigo-600">
                        Pick&nbsp;{b.team}
                      </span>
                    )}

                    <p className="text-sm text-slate-700">
                      Stake&nbsp;
                      <span className="font-mono font-semibold text-slate-900">
                        ${b.stake}
                      </span>
                    </p>

                    <p className="text-sm text-emerald-700">
                      Returns&nbsp;
                      <span className="font-mono font-semibold">
                        ${calcReturn(b.stake, b.odds ?? 0).toFixed(2)}

                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-white/30 bg-white/30 px-4 py-3 backdrop-blur-sm">
                    <button
                      onClick={() => openEdit(b)}
                      className="rounded-md border border-amber-400 bg-amber-50/60 px-3 py-1 text-xs font-semibold text-amber-700 backdrop-blur hover:bg-amber-100/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDelete(b)}
                      className="rounded-md border border-rose-400 bg-rose-50/60 px-3 py-1 text-xs font-semibold text-rose-700 backdrop-blur hover:bg-rose-100/80"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <EditModal
        open={editOpen}
        close={() => setEditOpen(false)}
        selected={selected}
        updateBet={updateBet}
      />
      <DeleteModal
        open={delOpen}
        close={() => setDelOpen(false)}
        selected={selected}
        removeBet={removeBet}
      />
    </>
  );
}


type ModalProps = {
  open: boolean;
  close: () => void;
  selected: any | null;
};

function EditModal({
  open,
  close,
  selected,
  updateBet,
}: ModalProps & { updateBet: (id: string, stake: number) => void }) {
  const [val, setVal] = useState(selected?.stake ?? 0);

  useEffect(() => {
    setVal(selected?.stake ?? 0);
  }, [selected]);

  const potential = selected ? calcReturn(val, selected.odds).toFixed(2) : "0.00";

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 grid place-content-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <Dialog.Title className="mb-3 text-lg font-bold">
                Edit&nbsp;Stake
              </Dialog.Title>

              <p className="mb-4 text-sm text-slate-700">
                {selected?.homeAbbrev} vs {selected?.awayAbbrev}
              </p>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Stake&nbsp;($)
                </span>
                <input
                  type="number"
                  min={1}
                  value={val}
                  onChange={(e) => setVal(+e.target.value)}
                  className="mt-1 w-full rounded border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <p className="mt-3 text-sm text-emerald-700">
                Potential return:&nbsp;
                <span className="font-mono font-semibold">${potential}</span>
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={close}
                  className="rounded px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selected && val > 0) updateBet(selected.id, val);
                    close();
                  }}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

function DeleteModal({
  open,
  close,
  selected,
  removeBet,
}: ModalProps & { removeBet: (id: string) => void }) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 grid place-content-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
              <Dialog.Title className="mb-4 text-lg font-bold text-rose-600">
                Cancel&nbsp;Bet
              </Dialog.Title>

              <p className="mb-6 text-sm text-slate-700">
                Are you sure you want to cancel your bet on{" "}
                <span className="font-medium">
                  {selected?.homeAbbrev} vs {selected?.awayAbbrev}
                </span>
                ?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={close}
                  className="rounded px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Keep
                </button>
                <button
                  onClick={() => {
                    if (selected) removeBet(selected.id);
                    close();
                  }}
                  className="rounded bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                >
                  Cancel&nbsp;Bet
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
