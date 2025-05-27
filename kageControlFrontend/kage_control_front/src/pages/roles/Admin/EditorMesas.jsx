import { useState } from "react";
import { PlusCircle, X, Trash2 } from "lucide-react";

export default function EditorMesas() {
  const [pisos, setPisos] = useState([1]);
  const [activo, setActivo] = useState(1);
  const [mesas, setMesas] = useState([]);
  const [arrastrando, setArrastrando] = useState(null);
  const [nuevoNumero, setNuevoNumero] = useState("");
  const [nuevoCapacidad, setNuevoCapacidad] = useState(4);
  const [error, setError] = useState("");

  const iniciarArrastre = (id) => setArrastrando(id);

  const moverMesa = (e) => {
    if (arrastrando === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nuevaX = e.clientX - rect.left - 35;
    const nuevaY = e.clientY - rect.top - 35;

    // Evitar solapamiento con una separación mínima de 80px
    const colision = mesas.some(
      (m) =>
        m.id !== arrastrando &&
        m.piso === activo &&
        Math.hypot(m.x - nuevaX, m.y - nuevaY) < 80
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

  const agregarMesa = () => {
    if (!nuevoNumero.trim()) return;
    const nuevaMesa = {
      id: Date.now(),
      numero: nuevoNumero,
      capacidad: nuevoCapacidad,
      piso: activo,
      x: 100,
      y: 100,
    };
    setMesas((prev) => [...prev, nuevaMesa]);
    setNuevoNumero("");
    setNuevoCapacidad(4);
  };

  const eliminarMesa = (id) => {
    setMesas((prev) => prev.filter((m) => m.id !== id));
  };

  const agregarPiso = () => {
    const siguiente = Math.max(...pisos) + 1;
    setPisos([...pisos, siguiente]);
    setActivo(siguiente);
  };

  const eliminarPiso = (p) => {
    if (pisos.length === 1) return;
    setPisos((prev) => prev.filter((x) => x !== p));
    setMesas((prev) => prev.filter((m) => m.piso !== p));
    setActivo(pisos.find((x) => x !== p) || 1);
  };

  const mesasPiso = mesas.filter((m) => m.piso === activo);
  const mesaSize = mesasPiso.length > 15 ? 40 : mesasPiso.length > 10 ? 50 : 64;

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Editor de Mesas</h1>

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
          onClick={agregarPiso}
          className="flex items-center gap-1 text-sm px-3 py-1 bg-[#3BAEA0] text-white rounded-full hover:bg-[#329b91]"
        >
          <PlusCircle className="w-4 h-4" /> Añadir piso
        </button>
        {pisos.length > 1 && (
          <button
            onClick={() => eliminarPiso(activo)}
            className="text-sm px-3 py-1 text-red-600 hover:underline"
          >
            Eliminar piso {activo}
          </button>
        )}
      </div>

      <div
        className="relative h-[450px] bg-white rounded-xl border border-dashed border-[#EADBC8]"
        onMouseMove={moverMesa}
        onMouseUp={soltarArrastre}
      >
        {mesasPiso.map((mesa) => (
          <div
            key={mesa.id}
            onMouseDown={() => iniciarArrastre(mesa.id)}
            className="absolute bg-[#264653] text-white rounded-full flex flex-col items-center justify-center shadow text-xs font-medium cursor-move select-none"
            style={{
              left: mesa.x,
              top: mesa.y,
              width: `${mesaSize}px`,
              height: `${mesaSize}px`,
            }}
          >
            <div>{mesa.numero}</div>
            <div className="text-[11px]">Cap: {mesa.capacidad}</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                eliminarMesa(mesa.id);
              }}
              className="absolute -top-2 -right-2 bg-[#8D2E38] hover:bg-[#6f1e25] p-1 rounded-full text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#4D4D4D]">Añadir Mesa</h3>
          <input
            type="text"
            placeholder="Número de mesa"
            value={nuevoNumero}
            onChange={(e) => setNuevoNumero(e.target.value)}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />
          <select
            value={nuevoCapacidad}
            onChange={(e) => setNuevoCapacidad(Number(e.target.value))}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none"
          >
            {[2, 4, 6, 8].map((n) => (
              <option key={n} value={n}>
                Capacidad: {n}
              </option>
            ))}
          </select>
          <button
            onClick={agregarMesa}
            className="flex items-center gap-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#2f9b90] transition w-full justify-center"
          >
            <PlusCircle className="w-5 h-5" />
            Añadir mesa
          </button>
        </div>
      </div>

      <p className="text-sm text-[#4D4D4D] mt-6 italic">
        🛠️ Puedes añadir, mover y eliminar mesas visualmente por piso. Las mesas se adaptan en tamaño si hay muchas. Las colisiones y cercanía se validan automáticamente.
      </p>
    </div>
  );
}
