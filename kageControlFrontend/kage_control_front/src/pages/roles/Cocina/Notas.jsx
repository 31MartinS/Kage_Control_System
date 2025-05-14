// src/pages/roles/Cocina/Notas.jsx
import { useState } from "react";

const INITIAL_ORDERS = [
  { id: 1, table: 2, notes: ["Sin gluten", "Vegano"] },
  { id: 2, table: 4, notes: ["Sin lactosa"] },
  { id: 3, table: 5, notes: ["Diabético"] },
];

export default function Notas() {
  const [filter, setFilter] = useState("");
  const orders = INITIAL_ORDERS.filter((o) =>
    filter
      ? o.notes.some((n) =>
          n.toLowerCase().includes(filter.toLowerCase())
        )
      : true
  );

  return (
    <div className="bg-[#FAFAFA] p-6 rounded-lg shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-[#184B6B]">Notas Dietéticas</h1>

      <div className="w-full max-w-sm">
        <label className="block text-[#1F2937] mb-1">Filtrar notas</label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Ej. sin gluten"
          className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0]"
        />
      </div>

      {orders.length === 0 ? (
        <p className="text-[#6B7280]">No hay notas que coincidan.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="bg-[#E5E7EB] p-4 rounded-lg shadow"
            >
              <p className="text-[#1F2937] font-semibold mb-1">
                Mesa {o.table}
              </p>
              <ul className="list-disc list-inside text-[#6B7280]">
                {o.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
