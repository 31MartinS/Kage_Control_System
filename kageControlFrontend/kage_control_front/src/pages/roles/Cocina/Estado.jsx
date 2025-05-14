// src/pages/roles/Cocina/Estado.jsx
import { useState } from "react";

const STATUS = [
  { label: "Pendiente", color: "bg-[#F75E5E] text-white" },
  { label: "En preparación", color: "bg-[#3BBAC9] text-white" },
  { label: "Listo para servir", color: "bg-[#3BAEA0] text-white" },
];

const DISHES = [
  { id: 1, orderId: 1, table: 2, name: "Steak", status: 0 },
  { id: 2, orderId: 1, table: 2, name: "Fries", status: 1 },
  { id: 3, orderId: 2, table: 4, name: "Salad", status: 0 },
  { id: 4, orderId: 3, table: 1, name: "Ice Cream", status: 2 },
];

export default function Estado() {
  const [dishes, setDishes] = useState(DISHES);

  const changeStatus = (id, newStatus) =>
    setDishes((all) =>
      all.map((dish) =>
        dish.id === id ? { ...dish, status: Number(newStatus) } : dish
      )
    );

  return (
    <div className="bg-[#FAFAFA] p-6 rounded-lg shadow-lg space-y-6">
      <h1 className="text-3xl font-bold text-[#184B6B]">
        Actualizar Estado de Platillos
      </h1>

      <div className="space-y-4 max-h-[60vh] overflow-auto">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            className="bg-[#F3F4F6] p-4 rounded-lg shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
          >
            <div className="space-y-1">
              <p className="text-[#1F2937] font-semibold">
                Mesa {dish.table} — {dish.name}
              </p>
              <p className="text-[#6B7280] text-sm">
                Orden #{dish.orderId}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
              <span
                className={`px-3 py-1 rounded-full font-medium ${STATUS[dish.status].color}`}
              >
                {STATUS[dish.status].label}
              </span>
              <select
                value={dish.status}
                onChange={(e) => changeStatus(dish.id, e.target.value)}
                className="px-2 py-1 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0]"
              >
                {STATUS.map((s, i) => (
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
