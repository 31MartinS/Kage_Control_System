import { useEffect, useState } from "react";
import axios from "axios";

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
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Notas Dietéticas</h1>

      <div className="w-full max-w-sm">
        <label className="block text-[#4D4D4D] font-medium mb-1">Filtrar notas</label>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Ej. sin cebolla"
          className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0]"
        />
      </div>

      {loading ? (
        <p className="text-[#6B7280]">Cargando notas...</p>
      ) : filteredNotes.length === 0 ? (
        <p className="text-[#6B7280]">No hay notas que coincidan.</p>
      ) : (
        <ul className="space-y-4">
          {filteredNotes.map(({ arrival_id, notes }) => (
            <li
              key={arrival_id}
              className="bg-white p-5 rounded-2xl border border-[#EADBC8] shadow"
            >
              <p className="text-[#4D4D4D] font-semibold mb-1">Mesa {arrival_id}</p>
              <ul className="list-disc list-inside text-[#6B7280]">
                {notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
