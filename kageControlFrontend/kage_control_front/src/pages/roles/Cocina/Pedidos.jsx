import { useState } from "react";

const STATIONS = ["Grill", "Cold", "Dessert"];
const INITIAL_ORDERS = [
  { id: 1, table: 2, station: "Grill", items: ["Steak", "Fries"], time: "12:00" },
  { id: 2, table: 4, station: "Cold", items: ["Salad", "Cold Soup"], time: "12:10" },
  { id: 3, table: 1, station: "Dessert", items: ["Ice Cream"], time: "12:15" },
  { id: 4, table: 5, station: "Grill", items: ["Burger"], time: "12:20" },
];

export default function Pedidos() {
  const [station, setStation] = useState(STATIONS[0]);
  const orders = INITIAL_ORDERS.filter((o) => o.station === station);

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Pedidos — Estación {station}
      </h1>

      <div className="flex flex-wrap gap-3">
        {STATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStation(s)}
            className={`px-5 py-2 rounded-full font-medium transition shadow-sm ${
              station === s
                ? "bg-[#3BAEA0] text-white"
                : "bg-white text-[#264653] border border-[#EADBC8] hover:bg-[#f1f1f1]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="text-[#6B7280]">
          No hay pedidos para esta estación en este momento.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="bg-white p-5 rounded-2xl border border-[#EADBC8] shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="space-y-1">
                <p className="text-[#4D4D4D] font-semibold">
                  Mesa {o.table} — {o.time}
                </p>
                <p className="text-gray-500 text-sm">{o.items.join(", ")}</p>
              </div>
              <button className="mt-3 sm:mt-0 px-5 py-2 bg-[#3BBAC9] hover:bg-[#22A1BB] text-white rounded-full font-medium shadow">
                Ver detalle
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
