// src/pages/roles/Mesero/PlanoMesas.jsx
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTablesSocket } from "../../../hooks/useTablesSocket";

const TABLES_POSITIONS = {
  1: [
    { id: 1, top: "22%", left: "16.3%" },
    { id: 2, top: "22%", left: "28%" },
    { id: 3, top: "44.5%", left: "16.3%" },
    { id: 4, top: "44.5%", left: "28%" },
    { id: 5, top: "74%", left: "17.4%" },
    { id: 6, top: "74%", left: "34%" },
  ],
  2: [
    { id: 7, top: "20.1%", left: "60%" },
    { id: 8, top: "20.1%", left: "81%" },
    { id: 9, top: "50.2%", left: "64.5%" },
    { id: 10, top: "50.2%", left: "81%" },
    { id: 11, top: "72.3%", left: "64.5%" },
    { id: 12, top: "72.3%", left: "81%" },
  ],
};

// Map de estado → clase de color Tailwind
const STATUS_COLOR = {
  libre: "bg-green-400",
  reservada: "bg-yellow-400",
  ocupado: "bg-red-400",
  limpieza: "bg-blue-400",
  desconocido: "bg-purple-400",
};

const STATUS_MAP = {
  free: "libre",
  reserved: "reservada",
  occupied: "ocupado",
  cleaning: "limpieza",
};

export default function PlanoMesas() {
  const [piso, setPiso] = useState(1);
  const tables = useTablesSocket(); // Array de mesas en tiempo real

  // Construimos un mapa { id: estadoLocal }
  const mesasEstado = useMemo(() => {
    const map = {};
    tables.forEach((t) => {
      const local = STATUS_MAP[t.status] || "desconocido";
      map[t.id] = local;
    });
    return map;
  }, [tables]);

  const posiciones = TABLES_POSITIONS[piso];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-blue-900">
        Plano de Mesas — Piso {piso}
      </h1>

      <div className="flex space-x-2">
        {[1, 2].map((n) => (
          <button
            key={n}
            onClick={() => setPiso(n)}
            className={`px-4 py-2 rounded ${
              piso === n
                ? "bg-teal-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Piso {n}
          </button>
        ))}
      </div>

      <div
        className="relative h-[700px] bg-cover bg-center rounded-lg shadow-lg overflow-hidden"
        style={{ backgroundImage: "url(/plano-restaurante.png)" }}
      >
        {posiciones.map(({ id, top, left }) => {
          const estado = mesasEstado[id] || "desconocido";
          const colorClass = STATUS_COLOR[estado] || STATUS_COLOR.desconocido;

          return (
            <motion.div
              key={id}
              whileHover={{ scale: 1.1 }}
              className={`absolute h-14 w-14 flex items-center justify-center rounded-full cursor-default ${colorClass}`}
              style={{ top, left, translate: "-50% -50%" }}
            >
              <span className="text-gray-800 font-semibold">
                M{id} ({estado})
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
