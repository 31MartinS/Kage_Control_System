import { useEffect, useState } from "react";
import { PlusCircle, Users, Trash2, LayoutTemplate } from "lucide-react";
import axiosClient from "../../../api/axiosClient";
import { connectWebSocket } from "../../../api/websocketClient";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function EditorMesas() {
  const [pisos, setPisos] = useState([1]);
  const [activo, setActivo] = useState(1);
  const [mesas, setMesas] = useState([]);
  const [arrastrando, setArrastrando] = useState(null);
  const [nuevoNumero, setNuevoNumero] = useState("");
  const [nuevoCapacidad, setNuevoCapacidad] = useState(4);
  const [nuevoEstado, setNuevoEstado] = useState("available");
  const [error, setError] = useState("");
  const [mesaEliminarId, setMesaEliminarId] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axiosClient.get("/tables");
        if (Array.isArray(res.data)) {
          const parsed = res.data.map((m) => ({
            ...m,
            piso: 1,
            x: m.x ?? Math.random() * 300 + 50,
            y: m.y ?? Math.random() * 300 + 50,
          }));
          setMesas(parsed);
        }
      } catch {
        butterup.error("Error al cargar las mesas.");
      }
    };

    fetchTables();

    const ws = connectWebSocket("/ws/tables", (data) => {
      if (data.event === "update_tables" && Array.isArray(data.tables)) {
        const actualizadas = data.tables.map((m) => {
          const local = mesas.find((t) => t.id === m.id);
          return {
            ...m,
            piso: local?.piso ?? 1,
            x: local?.x ?? 100,
            y: local?.y ?? 100,
          };
        });
        setMesas(actualizadas);
      }
    });

    return () => ws.close();
    // eslint-disable-next-line
  }, []);

  const iniciarArrastre = (id) => setArrastrando(id);

  const moverMesa = (e) => {
    if (arrastrando === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nuevaX = e.clientX - rect.left - 45;
    const nuevaY = e.clientY - rect.top - 45;

    const colision = mesas.some(
      (m) =>
        m.id !== arrastrando &&
        m.piso === activo &&
        Math.hypot(m.x - nuevaX, m.y - nuevaY) < 100
    );

    if (colision) {
      setError("Demasiado cerca de otra mesa.");
      return;
    }

    setError("");
    setMesas((prev) =>
      prev.map((m) =>
        m.id === arrastrando ? { ...m, x: nuevaX, y: nuevaY } : m
      )
    );
  };

  const soltarArrastre = () => setArrastrando(null);

  const agregarMesa = async () => {
    if (!nuevoNumero.trim()) {
      setError("El número de mesa es obligatorio.");
      butterup.error("El número de mesa es obligatorio.");
      return;
    }
    setError("");
    try {
      const res = await axiosClient.post("/tables", {
        name: nuevoNumero,
        capacity: nuevoCapacidad,
        status: nuevoEstado,
        x: Math.random() * 400 + 30,
        y: Math.random() * 300 + 30,
      });

      if (res.data) {
        setMesas((prev) => [
          ...prev,
          {
            ...res.data,
            piso: activo,
            x: res.data.x ?? Math.random() * 400 + 30,
            y: res.data.y ?? Math.random() * 300 + 30,
          },
        ]);
        butterup.success("Mesa creada exitosamente.");
      }

      setNuevoNumero("");
      setNuevoCapacidad(4);
      setNuevoEstado("available");
    } catch {
      setError("Error al crear mesa.");
      butterup.error("Error al crear mesa.");
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axiosClient.put(`/tables/${id}`, { status: nuevoEstado });
      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: nuevoEstado } : m))
      );
    } catch {
      butterup.error("Error actualizando el estado de la mesa.");
    }
  };

  const mesasPiso = mesas.filter((m) => m.piso === activo);

  const handleEliminarMesa = async () => {
    try {
      await axiosClient.delete(`/tables/${mesaEliminarId}`);
      setMesas((prev) => prev.filter((m) => m.id !== mesaEliminarId));
      butterup.success("Mesa eliminada exitosamente.");
    } catch {
      butterup.error("Error al eliminar la mesa.");
    } finally {
      setMesaEliminarId(null);
    }
  };

  // Estilos para la cuadrícula de la pizarra
  const gridStyle = {
    backgroundImage: `
      linear-gradient(to right, #ece9e1 1px, transparent 1px),
      linear-gradient(to bottom, #ece9e1 1px, transparent 1px)
    `,
    backgroundSize: "30px 30px",
    backgroundPosition: "0 0, 0 0",
  };

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] space-y-8 max-w-6xl mx-auto font-sans min-h-[70vh]">
      <h1 className="flex justify-center items-center gap-3 text-4xl font-extrabold text-[#3BAEA0] tracking-tight mb-2">
        <LayoutTemplate className="w-10 h-10 text-[#264653]" />
        Editor de Mesas
      </h1>

      {/* Pisos */}
      <div className="flex gap-3 flex-wrap mb-2 justify-center">
        {pisos.map((p) => (
          <button
            key={p}
            onClick={() => setActivo(p)}
            className={`px-6 py-2 rounded-full font-bold border-2 text-lg transition shadow
              ${p === activo
                ? "bg-[#264653] text-white border-transparent"
                : "bg-white text-[#264653] border-[#264653] hover:bg-[#f4f4f4]"}
            `}
          >
            Piso {p}
          </button>
        ))}
        <button
          onClick={() => {
            const siguiente = Math.max(...pisos) + 1;
            setPisos([...pisos, siguiente]);
            setActivo(siguiente);
          }}
          className="flex items-center gap-2 text-sm px-4 py-2 bg-[#3BAEA0] text-white rounded-full font-bold hover:bg-[#329b91] transition shadow"
        >
          <PlusCircle className="w-5 h-5" /> Añadir piso
        </button>
      </div>

      {/* Área mesas cuadriculada */}
      <div
        className="relative h-[450px] bg-white rounded-2xl border-2 border-dashed border-[#EADBC8] shadow-lg"
        style={gridStyle}
        onMouseMove={moverMesa}
        onMouseUp={soltarArrastre}
      >
        {mesasPiso.map((mesa) => (
          <div
            key={mesa.id}
            onMouseDown={() => iniciarArrastre(mesa.id)}
            onDoubleClick={() =>
              cambiarEstado(
                mesa.id,
                mesa.status === "available" ? "occupied" : "available"
              )
            }
            title="Doble click para cambiar estado"
            className={`absolute cursor-move rounded-2xl shadow-lg p-4 w-[90px] h-[90px] flex flex-col justify-center items-center border-4 transition-colors duration-300 group
              ${
                mesa.status === "occupied"
                  ? "border-red-600 bg-red-100 text-red-800"
                  : "border-green-600 bg-green-100 text-green-900"
              }
            `}
            style={{
              left: mesa.x,
              top: mesa.y,
              userSelect: "none",
            }}
          >
            {/* Botón de eliminar solo visible al pasar mouse */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMesaEliminarId(mesa.id);
              }}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-[#E76F51] text-white rounded-full p-1 shadow hover:bg-[#b53224] z-20"
              title="Eliminar mesa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-3xl leading-none select-none">{mesa.name}</span>
            <div className="mt-1 flex items-center gap-1 bg-white bg-opacity-70 rounded-full px-2 py-[2px] shadow">
              <Users className="w-4 h-4 text-gray-700" />
              <span className="text-base font-bold select-none">{mesa.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Errores */}
      {error && <p className="text-red-600 text-sm font-bold mt-2 animate-pulse">{error}</p>}

      {/* Formulario agregar mesa */}
      <div className="mt-8 grid md:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <label
            htmlFor="numeroMesa"
            className="block text-[#264653] font-bold text-lg"
          >
            Número de mesa
          </label>
          <input
            id="numeroMesa"
            type="text"
            placeholder="Ej: 12"
            value={nuevoNumero}
            onChange={(e) => setNuevoNumero(e.target.value)}
            className="w-full px-5 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold shadow"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="capacidadMesa"
            className="block text-[#264653] font-bold text-lg"
          >
            Capacidad
          </label>
          <select
            id="capacidadMesa"
            value={nuevoCapacidad}
            onChange={(e) => setNuevoCapacidad(Number(e.target.value))}
            className="w-full px-5 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none font-semibold shadow"
          >
            {[2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n} personas
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="estadoMesa"
            className="block text-[#264653] font-bold text-lg"
          >
            Estado
          </label>
          <select
            id="estadoMesa"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            className="w-full px-5 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none font-semibold shadow"
          >
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
          </select>
        </div>

        <button
          onClick={agregarMesa}
          className="flex items-center gap-2 bg-[#3BAEA0] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2f9b90] transition justify-center shadow"
        >
          <PlusCircle className="w-5 h-5" />
          Añadir mesa
        </button>
      </div>

      <p className="text-base text-[#264653] mt-8 italic text-center">
        🛠️ Doble click en una mesa para cambiar su estado entre disponible y ocupada. Arrastra para mover mesas.
      </p>

      {/* Modal gourmet eliminar mesa */}
      <AnimatePresence>
        {mesaEliminarId && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white border-2 border-[#E76F51] rounded-3xl shadow-2xl p-8 w-96 text-center"
            >
              <h2 className="text-2xl font-bold text-[#E76F51] mb-4">¿Eliminar mesa?</h2>
              <p className="text-[#264653] mb-6">Esta acción eliminará la mesa seleccionada.</p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => setMesaEliminarId(null)}
                  className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-bold shadow transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarMesa}
                  className="flex-1 py-2 rounded-full bg-[#E76F51] hover:bg-[#b53224] text-white font-bold shadow transition"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
