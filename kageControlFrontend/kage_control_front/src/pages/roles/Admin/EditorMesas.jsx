import { useEffect, useState, useCallback } from "react";
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
  const [nuevoEstado, setNuevoEstado] = useState("free");
  const [error, setError] = useState("");
  const [mesaEliminarId, setMesaEliminarId] = useState(null);
  const [mesaEditando, setMesaEditando] = useState(null);
  const [editCapacidad, setEditCapacidad] = useState(4);
  const [editEstado, setEditEstado] = useState("free");
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axiosClient.get("/tables");
        if (Array.isArray(res.data)) {
          // Ordenar mesas en grilla solo si no tienen x/y
          let mesasOrdenadas = [...res.data];
          const mesasSinPos = mesasOrdenadas.filter(m => m.x == null || m.y == null);
          if (mesasSinPos.length > 0) {
            // Parámetros de la grilla
            const gridCols = 5;
            const cellW = 120;
            const cellH = 120;
            const startX = 60;
            const startY = 60;
            mesasOrdenadas = mesasOrdenadas.map((m, idx) => {
              if (m.x == null || m.y == null) {
                // Solo asignar a los que no tienen posición
                const pos = mesasSinPos.indexOf(m);
                const col = pos % gridCols;
                const row = Math.floor(pos / gridCols);
                return {
                  ...m,
                  piso: 1,
                  x: startX + col * cellW,
                  y: startY + row * cellH,
                };
              } else {
                return {
                  ...m,
                  piso: 1,
                };
              }
            });
          } else {
            mesasOrdenadas = mesasOrdenadas.map(m => ({ ...m, piso: 1 }));
          }
          setMesas(mesasOrdenadas);
        }
      } catch {
        butterup.toast({
          title: "Error",
          message: "Error al cargar las mesas.",
          type: "error",
          location: "top-right",
          dismissable: true
        });
      }
    };

    fetchTables();
    
    const ws = connectWebSocket("/ws/tables", (data) => {
      console.log("WebSocket evento recibido:", data.event);
      
      if (data.event === "table_deleted" && data.table_id) {
        console.log("Mesa eliminada via WebSocket:", data.table_id);
        setMesas(mesasActuales => {
          const nuevasMesas = mesasActuales.filter(m => m.id !== data.table_id);
          console.log("Mesas después de eliminar:", nuevasMesas.length);
          return nuevasMesas;
        });
      }
      
      if (data.event === "update_tables" && Array.isArray(data.tables)) {
        console.log("WebSocket recibió actualización:", data.tables.length, "mesas");
        setMesas(mesasActuales => {
          console.log("Estado actual:", mesasActuales.length, "mesas");
          
          // Crear un mapa de las mesas actuales por ID para búsqueda rápida
          const mesasActualesMap = new Map(mesasActuales.map(m => [m.id, m]));
          
          const actualizadas = data.tables.map((mesaActualizada) => {
            const mesaLocal = mesasActualesMap.get(mesaActualizada.id);
            if (mesaLocal) {
              // Mesa existente: preservar coordenadas
              return {
                ...mesaActualizada,
                piso: mesaLocal.piso,
                x: mesaLocal.x,
                y: mesaLocal.y,
              };
            } else {
              // Mesa nueva: asignar posición ordenada
              console.log("Nueva mesa detectada:", mesaActualizada.name);
              const mesasEnPiso = mesasActuales.filter(m => m.piso === 1);
              const gridCols = 5;
              const cellW = 120;
              const cellH = 120;
              const startX = 60;
              const startY = 60;
              const pos = mesasEnPiso.length;
              const col = pos % gridCols;
              const row = Math.floor(pos / gridCols);
              
              return {
                ...mesaActualizada,
                piso: 1,
                x: startX + col * cellW,
                y: startY + row * cellH,
              };
            }
          });
          
          console.log("Actualizando a:", actualizadas.length, "mesas");
          return actualizadas;
        });
      }
    });

    return () => ws.close();
  }, []); // Sin dependencias para evitar reconexiones

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
        Math.hypot(m.x - nuevaX, m.y - nuevaY) < 50
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
      butterup.toast({
        title: "Error",
        message: "El número de mesa es obligatorio.",
        type: "error",
        location: "top-right",
        dismissable: true
      });
      return;
    }
    
    // Validar que sea un número válido
    if (isNaN(nuevoNumero) || Number(nuevoNumero) <= 0) {
      setError("Ingrese un número de mesa válido.");
      butterup.toast({
        title: "Error",
        message: "Ingrese un número de mesa válido.",
        type: "error",
        location: "top-right",
        dismissable: true
      });
      return;
    }
    
    setError("");
    try {
      const res = await axiosClient.post("/tables", {
        name: `Mesa ${nuevoNumero}`,
        capacity: nuevoCapacidad,
        status: nuevoEstado,
      });

      if (res.data) {
        butterup.toast({
          title: "Éxito",
          message: "Mesa creada exitosamente.",
          type: "success",
          location: "top-right",
          dismissable: true
        });
        cerrarModalAgregar();
        // No actualizar estado local aquí, dejar que el WebSocket lo haga
      }
    } catch {
      setError("Error al crear mesa.");
      butterup.toast({
        title: "Error",
        message: "Error al crear mesa.",
        type: "error",
        location: "top-right",
        dismissable: true
      });
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axiosClient.put(`/tables/${id}`, { status: nuevoEstado });
      setMesas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: nuevoEstado } : m))
      );
    } catch {
      butterup.toast({
        title: "Error",
        message: "Error actualizando el estado de la mesa.",
        type: "error",
        location: "top-right",
        dismissable: true
      });
    }
  };

  const mesasPiso = mesas.filter((m) => m.piso === activo);

  const handleEliminarMesa = async () => {
    try {
      await axiosClient.delete(`/tables/${mesaEliminarId}`);
      butterup.toast({
        title: "Éxito",
        message: "Mesa eliminada exitosamente.",
        type: "success",
        location: "top-right",
        dismissable: true
      });
      // Confiar en el WebSocket para la actualización
    } catch {
      butterup.toast({
        title: "Error",
        message: "Error al eliminar la mesa.",
        type: "error",
        location: "top-right",
        dismissable: true
      });
    } finally {
      setMesaEliminarId(null);
    }
  };

  const abrirEdicionMesa = (mesa) => {
    setMesaEditando(mesa);
    setEditCapacidad(mesa.capacity);
    setEditEstado(mesa.status);
  };

  const cerrarEdicionMesa = () => {
    setMesaEditando(null);
    setEditCapacidad(4);
    setEditEstado("free");
  };

  const abrirModalAgregar = () => {
    setMostrarModalAgregar(true);
    setNuevoNumero("");
    setNuevoCapacidad(4);
    setNuevoEstado("free");
    setError("");
  };

  const cerrarModalAgregar = () => {
    setMostrarModalAgregar(false);
    setNuevoNumero("");
    setNuevoCapacidad(4);
    setNuevoEstado("free");
    setError("");
  };

  const guardarEdicionMesa = async () => {
    try {
      // Actualizar estado local inmediatamente para evitar parpadeos
      setMesas((prev) =>
        prev.map((m) =>
          m.id === mesaEditando.id
            ? { ...m, capacity: editCapacidad, status: editEstado }
            : m
        )
      );
      
      await axiosClient.put(`/tables/${mesaEditando.id}`, {
        capacity: editCapacidad,
        status: editEstado,
      });
      
      butterup.toast({
        title: "Éxito",
        message: "Mesa actualizada exitosamente.",
        type: "success",
        location: "top-right",
        dismissable: true
      });
      cerrarEdicionMesa();
    } catch {
      // Si falla, revertir el cambio local
      setMesas((prev) =>
        prev.map((m) =>
          m.id === mesaEditando.id
            ? { ...m, capacity: mesaEditando.capacity, status: mesaEditando.status }
            : m
        )
      );
      
      butterup.toast({
        title: "Error",
        message: "Error al actualizar la mesa.",
        type: "error",
        location: "top-right",
        dismissable: true
      });
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
            onDoubleClick={() => abrirEdicionMesa(mesa)}
            title="Doble click para editar mesa"
            className={`absolute cursor-move rounded-2xl shadow-lg p-4 w-[90px] h-[90px] flex flex-col justify-center items-center border-4 transition-colors duration-300 group
              ${
                mesa.status === "occupied"
                  ? "border-red-600 bg-red-100 text-red-800"
                  : mesa.status === "reserved"
                  ? "border-yellow-600 bg-yellow-100 text-yellow-800"
                  : mesa.status === "cleaning"
                  ? "border-blue-600 bg-blue-100 text-blue-800"
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

      {/* Botón para agregar mesa */}
      <div className="flex justify-center mt-6">
        <button
          onClick={abrirModalAgregar}
          className="flex items-center gap-3 bg-[#3BAEA0] text-white px-8 py-4 rounded-full font-bold hover:bg-[#2f9b90] transition shadow-lg text-lg"
        >
          <PlusCircle className="w-6 h-6" />
          Agregar Nueva Mesa
        </button>
      </div>

      <p className="text-base text-[#264653] mt-8 italic text-center">
        🛠️ Doble click en una mesa para editarla. Arrastra para mover mesas.
      </p>

      {/* Modal para agregar nueva mesa */}
      <AnimatePresence>
        {mostrarModalAgregar && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white border-2 border-[#3BAEA0] rounded-3xl shadow-2xl p-8 w-96 max-w-[90vw]"
            >
              <h2 className="text-2xl font-bold text-[#264653] mb-6 text-center flex items-center justify-center gap-2">
                <PlusCircle className="w-6 h-6 text-[#3BAEA0]" />
                Agregar Nueva Mesa
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#264653] font-bold text-lg mb-2">
                    Número de mesa
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 12 (solo el número)"
                    value={nuevoNumero}
                    onChange={(e) => setNuevoNumero(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[#264653] font-bold text-lg mb-2">
                    Capacidad
                  </label>
                  <select
                    value={nuevoCapacidad}
                    onChange={(e) => setNuevoCapacidad(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  >
                    {[2, 4, 6, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} personas
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#264653] font-bold text-lg mb-2">
                    Estado inicial
                  </label>
                  <select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  >
                    <option value="free">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="reserved">Reservada</option>
                    <option value="cleaning">Limpieza</option>
                  </select>
                </div>

                {error && <p className="text-red-600 text-sm font-bold animate-pulse">{error}</p>}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={cerrarModalAgregar}
                  className="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-bold shadow transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={agregarMesa}
                  className="flex-1 py-3 rounded-full bg-[#3BAEA0] hover:bg-[#2f9b90] text-white font-bold shadow transition flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear Mesa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de edición de mesa */}
      <AnimatePresence>
        {mesaEditando && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white border-2 border-[#3BAEA0] rounded-3xl shadow-2xl p-8 w-96"
            >
              <h2 className="text-2xl font-bold text-[#264653] mb-6 text-center">
                Editar Mesa {mesaEditando.name}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[#264653] font-bold text-lg mb-2">
                    Capacidad
                  </label>
                  <select
                    value={editCapacidad}
                    onChange={(e) => setEditCapacidad(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  >
                    {[2, 4, 6, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} personas
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#264653] font-bold text-lg mb-2">
                    Estado
                  </label>
                  <select
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  >
                    <option value="free">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="reserved">Reservada</option>
                    <option value="cleaning">Limpieza</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={cerrarEdicionMesa}
                  className="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-bold shadow transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarEdicionMesa}
                  className="flex-1 py-3 rounded-full bg-[#3BAEA0] hover:bg-[#2f9b90] text-white font-bold shadow transition"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
