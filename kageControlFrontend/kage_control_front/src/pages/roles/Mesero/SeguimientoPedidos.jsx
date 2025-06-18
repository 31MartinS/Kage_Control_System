import { useEffect, useState } from "react";
import axios from "axios";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "in_preparation", label: "En preparación", color: "bg-[#3BBAC9] text-white" },
  { value: "ready", label: "Listo para servir", color: "bg-[#3BAEA0] text-white" },
  { value: "sent", label: "Enviado", color: "bg-[#F4A261] text-white" },
  { value: "served", label: "Servido", color: "bg-gray-200 text-gray-700 line-through" },
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
    try {
      await axios.patch(`http://localhost:8000/orders/${id}/status?status=${newStatus}`);
      setOrders((orders) =>
        orders.map((ord) =>
          ord.id === id ? { ...ord, status: newStatus } : ord
        )
      );
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-5xl mx-auto space-y-8 font-sans min-h-[80vh]">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight">
        Seguimiento de Pedidos
      </h1>

      {/* Filtro por estado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 max-w-lg mx-auto">
        <div>
          <label className="block text-[#264653] font-semibold mb-1 font-sans">Filtrar por estado</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-5 py-3 border-2 border-[#EADBC8] rounded-full bg-white font-semibold text-[#264653] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] shadow"
          >
            <option value="all">Todos</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-6 max-h-[60vh] overflow-auto">
        {filtered.length === 0 && (
          <p className="text-[#6B7280] text-center text-lg font-sans">No hay pedidos en este estado.</p>
        )}

        {filtered.map((ord) => {
          const currentStatus = STATUS_OPTIONS.find((s) => s.value === ord.status) || {
            label: "Desconocido",
            color: "bg-gray-300 text-gray-500",
          };

          const allowedTransitions = {
            pending: ["pending", "in_preparation"],
            in_preparation: ["in_preparation", "ready"],
            ready: ["ready", "served"],
            sent: ["sent", "served"],
            served: ["served"],
          };

          return (
            <div
              key={ord.id}
              className="bg-white border-2 border-[#EADBC8] p-7 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-2xl transition"
            >
              <div className="space-y-1">
                <p className="text-[#264653] font-bold text-lg">
                  Mesa {ord.table || "?"} — <span className="font-normal text-[#3BAEA0]">{ord.time}</span>
                </p>
                <p className="text-gray-500 text-base">{ord.items.join(", ")}</p>
              </div>

              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <span
                  className={`px-6 py-2 rounded-full text-base font-bold shadow ${currentStatus.color} border border-[#EADBC8]`}
                >
                  {currentStatus.label}
                </span>

                <select
                  value={ord.status}
                  onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                  disabled={ord.status === "served" || ord.status === "pending"}
                  className={`px-4 py-2 border-2 rounded-full font-semibold text-[#264653] transition
                    ${
                      ord.status === "served"
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                        : "bg-white border-[#EADBC8] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] shadow"
                    }`}
                >
                  {STATUS_OPTIONS.filter((s) =>
                    allowedTransitions[ord.status]?.includes(s.value)
                  ).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
