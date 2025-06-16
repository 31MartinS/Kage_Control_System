import { useState } from "react";
import { FileDown, CalendarRange, SlidersHorizontal } from "lucide-react";
import axios from "axios";

const SECCIONES_DISPONIBLES = [
  { id: "reservas", label: "Reservas" },
  { id: "meseros", label: "Rendimiento del personal" },
  { id: "ordenes", label: "Órdenes y consumo" },
  { id: "comensales", label: "Comensales y grupos" },
];

export default function Informes() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [seleccionadas, setSeleccionadas] = useState(["reservas"]);

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const seleccionarTodo = () => {
    if (seleccionadas.length === SECCIONES_DISPONIBLES.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(SECCIONES_DISPONIBLES.map((s) => s.id));
    }
  };

  const descargarPDF = async () => {
    if (!desde || !hasta || seleccionadas.length === 0) {
      alert("Selecciona fechas válidas y al menos una sección.");
      return;
    }

    try {
      const url = `http://localhost:8000/reports/attendance/pdf?start=${encodeURIComponent(
        desde
      )}&end=${encodeURIComponent(hasta)}`;

      const res = await axios.get(url, {
        responseType: "blob",
      });

      const file = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = "reporte_kagecontrol.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error descargando informe:", err);
      alert("Ocurrió un error al generar el informe.");
    }
  };

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Generar Informe en PDF
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Tipo de sección */}
        <div className="md:col-span-1">
          <label className="block mb-2 font-semibold text-[#4D4D4D]">
            Secciones a incluir
          </label>
          <div className="space-y-2 bg-white rounded-xl border border-[#EADBC8] p-4">
            {SECCIONES_DISPONIBLES.map((s) => (
              <label key={s.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={seleccionadas.includes(s.id)}
                  onChange={() => toggleSeleccion(s.id)}
                />
                {s.label}
              </label>
            ))}
            <button
              onClick={seleccionarTodo}
              className="text-sm text-blue-600 underline mt-2"
            >
              {seleccionadas.length === SECCIONES_DISPONIBLES.length
                ? "Deseleccionar todo"
                : "Seleccionar todo"}
            </button>
          </div>
        </div>

        {/* Fecha Desde */}
        <div>
          <label className="block mb-1 text-[#4D4D4D] font-medium">Desde</label>
          <input
            type="datetime-local"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block mb-1 text-[#4D4D4D] font-medium">Hasta</label>
          <input
            type="datetime-local"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={() => alert("Vista previa no implementada aún")}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#264653] text-white font-medium hover:bg-[#1b3540] transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Vista previa
        </button>
        <button
          onClick={descargarPDF}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#3BAEA0] text-white font-medium hover:bg-[#329b91] transition"
        >
          <FileDown className="w-4 h-4" />
          Descargar PDF
        </button>
      </div>
    </div>
  );
}
