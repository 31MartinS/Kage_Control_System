import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTablesSocket } from "../../../hooks/useTablesSocket";
import axiosClient from "../../../api/axiosClient";

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
const STATUS_BORDER = {
  libre: "border-[#3BAEA0]",
  reservada: "border-[#F4A261]",
  ocupado: "border-[#E76F51]",
  limpieza: "border-[#264653]",
  desconocido: "border-purple-400",
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
  const [arrivals, setArrivals] = useState([]);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    axiosClient.get("/arrivals").then((res) => setArrivals(res.data));
  }, []);

  const mesasEstado = useMemo(() => {
    const map = {};
    tables.forEach((t) => {
      const estadoLocal = STATUS_MAP[t.status] || "desconocido";
      map[t.id] = estadoLocal;
    });
    return map;
  }, [tables]);

  const handleMesaClick = (id) => {
    const arrival = arrivals.find((a) => a.table_id === id);
    if (arrival) setModalData(arrival);
    else setModalData({ customer_name: "Sin llegada registrada", table_id: id });
  };

  const posiciones = TABLES_POSITIONS[piso] || [];

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-5xl mx-auto space-y-8 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight">
        Plano de Mesas — Piso {piso}
      </h1>

      <div className="flex space-x-4 justify-center">
        {[1, 2].map((n) => (
          <button
            key={n}
            onClick={() => setPiso(n)}
            className={`px-6 py-2 rounded-full border-2 font-semibold shadow-sm text-lg transition-all
              ${piso === n
                ? "bg-[#264653] text-white border-transparent scale-105"
                : "bg-white text-[#264653] border-[#264653] hover:bg-[#f1f1f1]"}
            `}
          >
            Piso {n}
          </button>
        ))}
      </div>

      <div
        className="relative h-[700px] bg-cover bg-center rounded-2xl shadow-2xl border-2 border-[#EADBC8] overflow-hidden"
        style={{ backgroundImage: "url(/plano-restaurante.png)" }}
      >
        {posiciones.map(({ id, top, left }) => {
          const estado = mesasEstado[id] || "desconocido";
          const colorClass = STATUS_COLOR[estado] || STATUS_COLOR.desconocido;
          const borderClass = STATUS_BORDER[estado] || STATUS_BORDER.desconocido;
          return (
            <motion.div
              key={id}
              whileHover={{ scale: 1.15, boxShadow: "0 6px 24px #3baea066" }}
              onClick={() => handleMesaClick(id)}
              className={`
                absolute h-16 w-16 flex flex-col items-center justify-center rounded-full cursor-pointer
                text-lg font-bold shadow-lg border-4 ${colorClass} ${borderClass}
                transition-all duration-200 hover:ring-4 hover:ring-[#3BAEA0] hover:shadow-2xl
              `}
              style={{ top, left, translate: "-50% -50%" }}
              title={`Mesa ${id}`}
            >
              <span className="drop-shadow">M{id}</span>
              <span className="text-xs font-semibold tracking-wide mt-1 capitalize">
                {estado}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Modal elegante */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-xs w-full border-2 border-[#3BAEA0] font-sans"
            >
              <button
                className="absolute top-3 right-4 text-[#3BAEA0] text-2xl font-bold hover:text-[#264653] transition"
                onClick={() => setModalData(null)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-[#3BAEA0] mb-4 text-center">Datos de Llegada</h2>
              <ul className="space-y-1 text-[#264653] text-base">
                <li>
                  <b>Cliente:</b> {modalData.customer_name}
                </li>
                <li>
                  <b>Mesa:</b> {modalData.table_id}
                </li>
                <li>
                  <b>Personas:</b> {modalData.party_size || "-"}
                </li>
                <li>
                  <b>Contacto:</b> {modalData.contact || "No registrado"}
                </li>
                <li>
                  <b>Preferencia:</b> {modalData.preferences || "Ninguna"}
                </li>
                <li>
                  <b>Hora asignación:</b> {modalData.assigned_at?.substring(11, 19) || "-"}
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
