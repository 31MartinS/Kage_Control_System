// 🎨 SEGUIMIENTO PEDIDOS - Estilo Gourmet Aplicado
import { useEffect, useState } from "react";
import axios from "axios";

const STATUS_OPTIONS = [
  { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { label: "En preparación", color: "bg-[#3BBAC9] text-white" },
  { label: "Listo para servir", color: "bg-[#3BAEA0] text-white" },
  { label: "Servido", color: "bg-gray-200 text-gray-700" },
];

export default function SeguimientoPedidos() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axios
      .get("http://localhost:8000/orders/tracking")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error al cargar pedidos:", err));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const statusStr = STATUS_OPTIONS[newStatus].label.toLowerCase().replace(/ /g, "_");

    try {
      await axios.patch(`http://localhost:8000/orders/${id}/status?status=${statusStr}`);
      setOrders((orders) =>
        orders.map((ord) => (ord.id === id ? { ...ord, status: Number(newStatus) } : ord))
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const filtered = orders.filter((o) => filter === "all" || o.status === Number(filter));

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Seguimiento de Pedidos
      </h1>

      {/* Filtro por estado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
        <div>
          <label className="block text-[#4D4D4D] font-medium mb-1">Filtrar por estado</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
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
            className="bg-white border border-[#EADBC8] p-5 rounded-2xl shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div className="space-y-1">
              <p className="text-[#4D4D4D] font-semibold">
                Mesa {ord.table || "?"} — {ord.time}
              </p>
              <p className="text-gray-500 text-sm">{ord.items.join(", ")}</p>
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${STATUS_OPTIONS[ord.status].color}`}
              >
                {STATUS_OPTIONS[ord.status].label}
              </span>
              <select
                value={ord.status}
                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                className="px-3 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
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
