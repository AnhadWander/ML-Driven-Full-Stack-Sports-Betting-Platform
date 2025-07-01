import OddsTable from "../components/OddsTable";
import { useParams } from "react-router-dom";

export default function OddsDashboard() {
  const { dt } = useParams();
  return (
    <main className="mx-auto max-w-7xl p-4">
      {dt ? (
        <OddsTable date={dt} />
      ) : (
        <p className="text-center text-xl text-gray-500">No date selected.</p>
      )}
    </main>
  );
}
