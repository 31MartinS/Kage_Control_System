import { useEffect, useState } from "react";
import { PlusCircle, Users } from "lucide-react";
import axiosClient from "../../../api/axiosClient";
import { connectWebSocket } from "../../../api/websocketClient";
import butterup from "butteruptoasts";
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
      } catch (err) {
        console.error("Error al obtener mesas:", err);
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

    return () => {
      ws.close();
    };
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

  const soltarArrastre = async () => {
    if (arrastrando === null) return;
    setArrastrando(null);
  };

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
    } catch (err) {
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
    } catch (err) {
      console.error("Error actualizando estado:", err);
      butterup.error("Error actualizando el estado de la mesa.");
    }
  };

  const mesasPiso = mesas.filter((m) => m.piso === activo);

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6 select-none">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Editor de Mesas</h1>

      {/* Pisos */}
      <div className="flex gap-3 flex-wrap">
        {pisos.map((p) => (
          <button
            key={p}
            onClick={() => setActivo(p)}
            className={`px-4 py-2 rounded-full font-medium border transition ${
              p === activo
                ? "bg-[#264653] text-white"
                : "bg-white text-[#264653] border-[#264653] hover:bg-[#f4f4f4]"
            }`}
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
          className="flex items-center gap-1 text-sm px-3 py-1 bg-[#3BAEA0] text-white rounded-full hover:bg-[#329b91]"
        >
          <PlusCircle className="w-4 h-4" /> Añadir piso
        </button>
      </div>

      {/* Área mesas */}
      <div
        className="relative h-[450px] bg-white rounded-xl border border-dashed border-[#EADBC8]"
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
            className={`absolute cursor-move rounded-2xl shadow-lg p-4 w-[90px] h-[90px] flex flex-col justify-center items-center border-4 transition-colors duration-300
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
            <span className="font-extrabold text-3xl leading-none select-none">
              {mesa.name}
            </span>
            <div className="mt-1 flex items-center gap-1 bg-white bg-opacity-70 rounded-full px-2 py-[2px]">
              <Users className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-semibold select-none">{mesa.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Errores */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Formulario agregar mesa */}
      <div className="mt-6 grid md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label
            htmlFor="numeroMesa"
            className="block text-[#4D4D4D] font-semibold"
          >
            Número de mesa
          </label>
          <input
            id="numeroMesa"
            type="text"
            placeholder="Ej: 12"
            value={nuevoNumero}
            onChange={(e) => setNuevoNumero(e.target.value)}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="capacidadMesa"
            className="block text-[#4D4D4D] font-semibold"
          >
            Capacidad
          </label>
          <select
            id="capacidadMesa"
            value={nuevoCapacidad}
            onChange={(e) => setNuevoCapacidad(Number(e.target.value))}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none"
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
            className="block text-[#4D4D4D] font-semibold"
          >
            Estado
          </label>
          <select
            id="estadoMesa"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none"
          >
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
          </select>
        </div>

        <button
          onClick={agregarMesa}
          className="flex items-center gap-2 bg-[#3BAEA0] text-white px-6 py-2 rounded-full font-medium hover:bg-[#2f9b90] transition justify-center"
        >
          <PlusCircle className="w-5 h-5" />
          Añadir mesa
        </button>
      </div>

      <p className="text-sm text-[#4D4D4D] mt-6 italic">
        🛠️ Doble click en una mesa para cambiar su estado entre disponible y
        ocupada. Arrastra para mover mesas.
      </p>
    </div>
  );
}
