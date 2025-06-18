import { useState, useEffect } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

const STATUS = [
  { label: "Pendiente", value: "pending", color: "bg-[#F75E5E] text-white" },
  { label: "En preparación", value: "in_preparation", color: "bg-[#3BBAC9] text-white" },
  { label: "Listo para servir", value: "ready", color: "bg-[#3BAEA0] text-white" },
  { label: "Enviado", value: "sent", color: "bg-[#F4A261] text-white" },
  { label: "Servido", value: "served", color: "bg-gray-200 text-gray-700 line-through" },
];

export default function Estado() {
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState({});
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de confirmación
  const [pendingChange, setPendingChange] = useState(null);

  // Obtener nombres de mesas
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("http://localhost:8000/tables/");
        const map = {};
        res.data.forEach((t) => {
          map[t.id] = t.name || `Mesa ${t.id}`;
        });
        setTables(map);
      } catch (e) {
        setError("Error al cargar mesas");
        console.error(e);
      }
    };
    fetchTables();
  }, []);

  // Obtener menú
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("http://localhost:8000/menu/available");
        const map = {};
        res.data.forEach((item) => {
          map[item.id] = {
            name: item.name,
            price: item.price,
            description: item.description,
          };
        });
        setMenu(map);
      } catch (e) {
        setError("Error al cargar menú");
        console.error(e);
      }
    };
    fetchMenu();
  }, []);

  // Obtener órdenes
  useEffect(() => {
    if (Object.keys(tables).length === 0 || Object.keys(menu).length === 0) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/orders/");
        const allDishes = [];
        res.data.forEach((order) => {
          order.dishes.forEach((dish, i) => {
            const platillo = menu[dish.dish_id] || {};
            allDishes.push({
              uniqueId: `${order.id}-${dish.dish_id}-${i}`,
              orderId: order.id,
              arrivalId: order.arrival_id,
              table: tables[order.arrival_id] || `Mesa ${order.arrival_id}`,
              dishId: dish.dish_id,
              dishName: platillo.name || `Platillo ${dish.dish_id}`,
              price: platillo.price || 0,
              description: platillo.description || "",
              quantity: dish.quantity,
              notes: order.notes,
              status: order.status,
            });
          });
        });
        setDishes(allDishes);
      } catch (e) {
        setError("Error al cargar órdenes");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [tables, menu]);

  // Manejo de cambio de estado con confirmación
  const requestStatusChange = (uniqueId, orderId, newStatus, dish) => {
    setPendingChange({ uniqueId, orderId, newStatus, dish });
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;
    const { uniqueId, orderId, newStatus } = pendingChange;
    try {
      setDishes((prev) =>
        prev.map((dish) =>
          dish.uniqueId === uniqueId ? { ...dish, status: newStatus } : dish
        )
      );
      await axios.patch(`http://localhost:8000/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      });
    } catch (e) {
      setError("Error al actualizar estado");
      console.error(e);
    } finally {
      setPendingChange(null);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-[#4D4D4D] font-semibold font-sans">Cargando datos...</div>;

  if (error)
    return <div className="p-8 text-center text-red-600 font-semibold font-sans">{error}</div>;

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-5xl mx-auto space-y-8 font-sans min-h-[80vh]">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight mb-6">
        Actualizar Estado de Platillos
      </h1>
      {dishes.length === 0 ? (
        <p className="text-[#6B7280] text-center font-sans">No hay platillos disponibles.</p>
      ) : (
        <div className="space-y-5">
          {dishes.map((dish) => {
            const status = STATUS.find((s) => s.value === dish.status) || STATUS[0];
            const allowedTransitions = {
              pending: ["pending", "in_preparation"],
              in_preparation: ["in_preparation", "ready"],
              ready: ["ready", "sent"],
              sent: ["sent"],
              served: ["served"],
            };
            return (
              <div
                key={dish.uniqueId}
                className="bg-white p-6 rounded-2xl border-2 border-[#EADBC8] shadow-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:shadow-2xl transition"
              >
                <div className="space-y-1">
                  <p className="text-[#264653] font-bold text-lg">
                    {dish.table} — {dish.dishName} <span className="font-normal text-[#3BAEA0]">(${dish.price})</span> — Cantidad: {dish.quantity}
                  </p>
                  {dish.description && (
                    <p className="text-[#6B7280] text-base">{dish.description}</p>
                  )}
                  {dish.notes && (
                    <p className="text-[#8D8D8D] italic text-base">Notas: {dish.notes}</p>
                  )}
                  <p className="text-gray-500 text-sm">Orden #{dish.orderId}</p>
                </div>
                <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                  <span
                    className={`px-5 py-2 rounded-full text-base font-bold ${status.color} border border-[#EADBC8]`}
                  >
                    {status.label}
                  </span>
                  <select
                    value={dish.status}
                    onChange={(e) =>
                      requestStatusChange(dish.uniqueId, dish.orderId, e.target.value, dish)
                    }
                    disabled={dish.status === "sent" || dish.status === "served"}
                    className={`px-4 py-2 border-2 rounded-full font-semibold text-[#264653] transition
                    ${
                      dish.status === "sent" || dish.status === "served"
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                        : "bg-white border-[#EADBC8] focus:ring-2 focus:ring-[#3BAEA0] shadow"
                    }`}
                  >
                    {STATUS.filter((s) =>
                      allowedTransitions[dish.status]?.includes(s.value)
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
      )}

      {/* Modal de confirmación */}
      <AnimatePresence>
        {pendingChange && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <div className="absolute inset-0 pointer-events-none" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border-2 border-[#3BAEA0] font-sans"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#264653] text-center">¿Confirmar cambio de estado?</h2>
              <ul className="mb-6 w-full text-left text-[#3BAEA0] text-base">
                <li>
                  <b>Platillo:</b> {pendingChange.dish.dishName}
                </li>
                <li>
                  <b>Mesa:</b> {pendingChange.dish.table}
                </li>
                <li>
                  <b>De:</b> {STATUS.find((s) => s.value === pendingChange.dish.status)?.label}
                </li>
                <li>
                  <b>A:</b> {STATUS.find((s) => s.value === pendingChange.newStatus)?.label}
                </li>
              </ul>
              <div className="flex gap-4 w-full">
                <button
                  onClick={confirmStatusChange}
                  className="flex-1 py-2 rounded-full bg-[#3BAEA0] hover:bg-[#329b91] text-white font-semibold shadow transition"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setPendingChange(null)}
                  className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-semibold shadow transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
