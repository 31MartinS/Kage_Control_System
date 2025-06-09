import { useState, useEffect } from "react";
import axios from "axios";

const STATUS = [
  { label: "Pendiente", value: "pending", color: "bg-[#F75E5E] text-white" },
  { label: "En preparación", value: "in_preparation", color: "bg-[#3BBAC9] text-white" },
  { label: "Listo para servir", value: "ready", color: "bg-[#3BAEA0] text-white" },
  { label: "Enviado", value: "sent", color: "bg-[#F7B731] text-white" },
  { label: "Servido", value: "served", color: "bg-[#4CAF50] text-white" },
];

export default function Estado() {
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState({});
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Obtener menú (platillos disponibles)
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

  const changeStatus = async (uniqueId, orderId, newStatus) => {
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
    }
  };

  if (loading)
    return <div className="p-8 text-center text-[#4D4D4D] font-semibold">Cargando datos...</div>;

  if (error)
    return <div className="p-8 text-center text-red-600 font-semibold">{error}</div>;

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6 max-h-[70vh] overflow-auto">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Actualizar Estado de Platillos</h1>

      {dishes.length === 0 ? (
        <p className="text-[#6B7280]">No hay platillos disponibles.</p>
      ) : (
        dishes.map((dish) => {
          const status = STATUS.find((s) => s.value === dish.status) || STATUS[0];
          return (
            <div
              key={dish.uniqueId}
              className="bg-white p-5 rounded-2xl border border-[#EADBC8] shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="space-y-1">
                <p className="text-[#4D4D4D] font-semibold">
                  {dish.table} — {dish.dishName} (${dish.price}) — Cantidad: {dish.quantity}
                </p>
                {dish.description && (
                  <p className="text-[#6B7280] text-sm">{dish.description}</p>
                )}
                {dish.notes && (
                  <p className="text-[#8D8D8D] italic text-sm">Notas: {dish.notes}</p>
                )}
                <p className="text-gray-500 text-sm">Orden #{dish.orderId}</p>
              </div>
              <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${status.color}`}
                >
                  {status.label}
                </span>
                <select
                  value={dish.status}
                  onChange={(e) =>
                    changeStatus(dish.uniqueId, dish.orderId, e.target.value)
                  }
                  className="px-3 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0]"
                >
                  {STATUS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
