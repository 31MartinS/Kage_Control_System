// src/pages/roles/Mesero/SeguimientoPedidos.jsx
import { useState } from "react";

const STATUS_OPTIONS = [
  { label: "Pendiente", color: "bg-yellow-200 text-yellow-800" },
  { label: "En preparación", color: "bg-[#3BBAC9] text-white" },  // azul cielo
  { label: "Listo para servir", color: "bg-[#3BAEA0] text-white" }, // verde menta
  { label: "Servido", color: "bg-gray-200 text-gray-700" },
];

const INITIAL_ORDERS = [
  {
    id: 1,
    table: 5,
    items: ["Ensalada César", "Sopa del día"],
    status: 0,
    time: "12:05",
  },
  {
    id: 2,
    table: 3,
    items: ["Filete a la plancha", "Postre del chef"],
    status: 1,
    time: "12:12",
  },
  {
    id: 3,
    table: 8,
    items: ["Sopa del día"],
    status: 2,
    time: "12:20",
  },
];

export default function SeguimientoPedidos() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filter, setFilter] = useState("all");

  const handleStatusChange = (id, newStatus) => {
    setOrders((o) =>
      o.map((ord) =>
        ord.id === id ? { ...ord, status: Number(newStatus) } : ord
      )
    );
  };

  const filtered = orders.filter(
    (o) => filter === "all" || o.status === Number(filter)
  );

  return (
    <div className="bg-[#FAFAFA] p-6 rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-bold text-[#184B6B]">Seguimiento de Pedidos</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
        <div>
          <label className="block text-[#1F2937] mb-1">Filtrar por estado</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded bg-white focus:outline-none"
          >
            <option value="all">Todos</option>
            {STATUS_OPTIONS.map((s, i) => (
              <option key={i} value={i}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4 max-h-[60vh] overflow-auto">
        {filtered.length === 0 && (
          <p className="text-[#6B7280]">No hay pedidos en este estado.</p>
        )}

        {filtered.map((ord) => (
          <div
            key={ord.id}
            className="bg-[#E5E7EB] p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            {/* Info del pedido */}
            <div className="space-y-1">
              <p className="text-[#1F2937] font-semibold">
                Mesa {ord.table} — {ord.time}
              </p>
              <p className="text-[#6B7280] text-sm">
                {ord.items.join(", ")}
              </p>
            </div>

            {/* Estado y selector */}
            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
              <span
                className={`px-3 py-1 rounded-full font-medium ${
                  STATUS_OPTIONS[ord.status].color
                }`}
              >
                {STATUS_OPTIONS[ord.status].label}
              </span>
              <select
                value={ord.status}
                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                className="px-2 py-1 border rounded bg-white focus:outline-none"
              >
                {STATUS_OPTIONS.map((s, i) => (
                  <option key={i} value={i}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
