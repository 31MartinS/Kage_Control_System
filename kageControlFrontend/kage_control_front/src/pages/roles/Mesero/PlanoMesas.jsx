// src/pages/roles/Mesero/PlanoMesas.jsx
import { useState } from "react";
import { motion } from "framer-motion";

const TABLES_POSITIONS = {
  1: [
    // Zona izquierda arriba (4 mesas cuadradas)
    { id: 1, top: "22%", left: "16.3%" },
    { id: 2, top: "22%", left: "28%" },
    { id: 3, top: "44.5%", left: "16.3%" },
    { id: 4, top: "44.5%", left: "28%" },
    // Zona izquierda abajo (2 mesas grandes)
    { id: 5, top: "74%", left: "17.4%" },
    { id: 6, top: "74%", left: "34%" },
  ],
  2: [
    // Zona derecha arriba (2 mesas grandes)
    { id: 7, top: "20.1%", left: "60%" },
    { id: 8, top: "20.1%", left: "81%" },
    // Zona derecha abajo (4 mesas grandes)
    { id: 9, top: "50.2%", left: "64.5%" },
    { id: 10, top: "50.2%", left: "81%" },
    { id: 11, top: "72.3%", left: "64.5%" },
    { id: 12, top: "72.3%", left: "81%" },
  ],
};

export default function PlanoMesas() {
  const [piso, setPiso] = useState(1);
  const [mesas, setMesas] = useState(
    Object.fromEntries(TABLES_POSITIONS[1].map(({ id }) => [id, "libre"]))
  );

  const toggleMesa = (id) => {
    setMesas((m) => ({ ...m, [id]: m[id] === "libre" ? "ocupado" : "libre" }));
  };

  const handlePiso = (nuevo) => {
    setPiso(nuevo);
    setMesas(
      Object.fromEntries(TABLES_POSITIONS[nuevo].map(({ id }) => [id, "libre"]))
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-blue-900">
        Plano de Mesas — Piso {piso}
      </h1>

      <div className="flex space-x-2">
        {[1, 2].map((n) => (
          <button
            key={n}
            onClick={() => handlePiso(n)}
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
        {TABLES_POSITIONS[piso].map(({ id, top, left }) => (
          <motion.div
            key={id}
            onClick={() => toggleMesa(id)}
            whileHover={{ scale: 1.1 }}
            className={`absolute h-14 w-14 flex items-center justify-center rounded-full cursor-pointer
              ${mesas[id] === "libre" ? "bg-teal-200" : "bg-red-200"}
            `}
            style={{ top, left, translate: "-50% -50%" }}
          >
            <span className="text-gray-800 font-semibold">M{id}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
