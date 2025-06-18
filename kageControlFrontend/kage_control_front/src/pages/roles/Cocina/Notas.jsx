import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function Notas() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8000/orders/1");
        setOrders(res.data);
      } catch (error) {
        console.error("Error al cargar notas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Agrupar notas por arrival_id, ignorando notas vacías y evitando repetidos
  const notesByArrival = orders.reduce((acc, order) => {
    if (!order.notes || order.notes.trim() === "") return acc;
    if (!acc[order.arrival_id]) acc[order.arrival_id] = new Set();
    acc[order.arrival_id].add(order.notes.trim());
    return acc;
  }, {});

  // Convertir a array para renderizar y filtrar
  const notesArray = Object.entries(notesByArrival).map(([arrival_id, notesSet]) => ({
    arrival_id,
    notes: Array.from(notesSet),
  }));

  // Aplicar filtro
  const filteredNotes = notesArray.filter(({ notes }) =>
    filter
      ? notes.some((note) => note.toLowerCase().includes(filter.toLowerCase()))
      : true
  );

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-3xl mx-auto min-h-[65vh] space-y-10 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight mb-4">
        Notas Dietéticas
      </h1>

      <div className="w-full max-w-md mx-auto mb-6">
        <label className="block text-[#264653] font-semibold mb-1 font-sans">Filtrar notas</label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Ej. sin cebolla"
          className="w-full px-5 py-3 border-2 border-[#EADBC8] rounded-full bg-white font-semibold text-[#264653] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] shadow"
        />
      </div>

      {loading ? (
        <p className="text-[#6B7280] text-center text-lg font-sans">Cargando notas...</p>
      ) : filteredNotes.length === 0 ? (
        <p className="text-[#6B7280] text-center text-lg font-sans">No hay notas que coincidan.</p>
      ) : (
        <ul className="space-y-6">
          <AnimatePresence>
            {filteredNotes.map(({ arrival_id, notes }) => (
              <motion.li
                key={arrival_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-6 rounded-2xl border-2 border-[#EADBC8] shadow-lg"
              >
                <p className="text-[#264653] font-bold mb-2 text-lg">
                  Mesa {arrival_id}
                </p>
                <ul className="list-disc list-inside text-[#3BAEA0] text-base space-y-1">
                  {notes.map((note, i) => (
                    <li key={i} className="pl-2">{note}</li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
