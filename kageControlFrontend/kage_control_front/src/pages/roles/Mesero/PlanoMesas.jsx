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

const STATUS_COLOR = {
  libre: "bg-[#3BAEA0]",
  reservada: "bg-[#F4A261]",
  ocupado: "bg-[#E76F51]",
  limpieza: "bg-[#264653]",
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
  const tables = useTablesSocket();

  const mesasEstado = useMemo(() => {
    const map = {};
    if (!Array.isArray(tables)) return map; // protección por si tables no es array
    tables.forEach((t) => {
      const estadoLocal = STATUS_MAP[t.status] || "desconocido";
      map[t.id] = estadoLocal;
    });
    return map;
  }, [tables]);

  const posiciones = TABLES_POSITIONS[piso] || [];

  const posicionesFiltradas = posiciones.filter(({ id }) =>
    mesasEstado.hasOwnProperty(id)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Plano de Mesas — Piso {piso}
      </h1>

      <div className="flex space-x-4">
        {[1, 2].map((n) => (
          <button
            key={n}
            onClick={() => setPiso(n)}
            className={`px-6 py-2 rounded-full border font-medium transition shadow-sm ${
              piso === n
                ? "bg-[#264653] text-white border-transparent"
                : "bg-white text-[#264653] border-[#264653] hover:bg-[#f1f1f1]"
            }`}
          >
            Piso {n}
          </button>
        ))}
      </div>

      <div
        className="relative h-[700px] bg-cover bg-center rounded-2xl shadow-lg border border-[#EADBC8] overflow-hidden"
        style={{ backgroundImage: "url(/plano-restaurante.png)" }}
      >
        {posicionesFiltradas.map(({ id, top, left }) => {
          const estado = mesasEstado[id] || "desconocido";
          const colorClass = STATUS_COLOR[estado] || STATUS_COLOR.desconocido;

          return (
            <motion.div
              key={id}
              whileHover={{ scale: 1.1 }}
              className={`absolute h-14 w-14 flex items-center justify-center rounded-full cursor-default text-sm font-semibold text-white shadow-md ${colorClass}`}
              style={{ top, left, translate: "-50% -50%" }}
            >
              M{id}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
