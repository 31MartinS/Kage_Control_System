import { useState } from "react";
import { FileDown, SlidersHorizontal } from "lucide-react";
import axios from "axios";
import butterup from "butteruptoasts";

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
  const [descargando, setDescargando] = useState(false);

  const [errores, setErrores] = useState({
    desde: "",
    hasta: "",
    secciones: "",
  });

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const seleccionarTodo = () => {
    if (seleccionadas.length === SECCIONES_DISPONIBLES.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(SECCIONES_DISPONIBLES.map((s) => s.id));
    }
  };

  const validarFormulario = () => {
    const ahora = new Date().toISOString();
    const nuevosErrores = {
      desde: "",
      hasta: "",
      secciones: "",
    };

    if (!desde) nuevosErrores.desde = "Fecha inicial requerida";
    if (!hasta) nuevosErrores.hasta = "Fecha final requerida";

    if (desde && hasta && desde > hasta) {
      nuevosErrores.desde = "No debe ser mayor a la fecha final";
      nuevosErrores.hasta = "No debe ser menor a la fecha inicial";
    }

    if (hasta && hasta > ahora) {
      nuevosErrores.hasta = "No puede ser una fecha futura";
    }

    if (seleccionadas.length === 0) {
      nuevosErrores.secciones = "Selecciona al menos una sección";
    }

    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((e) => !e);
  };

  const descargarPDF = async () => {
    if (!validarFormulario()) return;

    setDescargando(true);
    try {
      const params = new URLSearchParams();
      params.append("start", desde);
      params.append("end", hasta);
      seleccionadas.forEach((seccion) => params.append("sections", seccion));

      const url = `http://localhost:8000/reports/pdf?${params.toString()}`;
      const res = await axios.get(url, { responseType: "blob" });

      const file = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(file);
      link.download = "reporte_kagecontrol.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      butterup.success("Descarga completada 📥");
    } catch (err) {
      butterup.error("Ocurrió un error al generar el informe.");
    } finally {
      setDescargando(false);
    }
  };

  const mostrarVistaPrevia = async () => {
    if (!validarFormulario()) return;

    try {
      const params = new URLSearchParams();
      params.append("start", desde);
      params.append("end", hasta);
      seleccionadas.forEach((seccion) => params.append("sections", seccion));

      const url = `http://localhost:8000/reports/pdf?${params.toString()}`;
      const res = await axios.get(url, { responseType: "blob" });

      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      window.open(fileURL, "_blank", "noopener,noreferrer");
    } catch (err) {
      butterup.error("No se pudo generar la vista previa del informe.");
    }
  };

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-3xl mx-auto space-y-10 font-sans min-h-[70vh]">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight mb-6 flex items-center justify-center gap-3">
        <FileDown className="w-8 h-8" />
        Generar Informe en PDF
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Tipo de sección */}
        <div className="md:col-span-1">
          <label className="block mb-2 font-bold text-[#264653] text-lg">Secciones a incluir</label>
          <div className="space-y-3 bg-white rounded-2xl border-2 border-[#EADBC8] p-5">
            {SECCIONES_DISPONIBLES.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-[#3BAEA0] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={seleccionadas.includes(s.id)}
                  onChange={() => toggleSeleccion(s.id)}
                  className="accent-[#3BAEA0] w-4 h-4 rounded focus:ring-2 focus:ring-[#3BAEA0] transition"
                />
                {s.label}
              </label>
            ))}
            <button
              onClick={seleccionarTodo}
              className="block w-full mt-2 text-sm text-blue-600 underline font-semibold hover:text-blue-900 transition"
            >
              {seleccionadas.length === SECCIONES_DISPONIBLES.length
                ? "Deseleccionar todo"
                : "Seleccionar todo"}
            </button>
            {errores.secciones && (
              <p className="text-[#E76F51] text-sm mt-1">{errores.secciones}</p>
            )}
          </div>
        </div>

        {/* Fecha Desde */}
        <div className="flex flex-col gap-2">
          <label className="block text-[#264653] font-bold text-lg">Desde</label>
          <input
            type="datetime-local"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            max={hasta || undefined}
            className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white font-semibold text-[#264653] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] shadow"
          />
          {errores.desde && <p className="text-[#E76F51] text-sm mt-1">{errores.desde}</p>}
        </div>

        {/* Fecha Hasta */}
        <div className="flex flex-col gap-2">
          <label className="block text-[#264653] font-bold text-lg">Hasta</label>
          <input
            type="datetime-local"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            max={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 border-2 border-[#EADBC8] rounded-full bg-white font-semibold text-[#264653] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] shadow"
          />
          {errores.hasta && <p className="text-[#E76F51] text-sm mt-1">{errores.hasta}</p>}
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-2">
        <button
          onClick={mostrarVistaPrevia}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#264653] text-white font-bold hover:bg-[#1b3540] shadow transition"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Vista previa
        </button>
        <button
          onClick={descargarPDF}
          disabled={descargando}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow transition
            ${descargando
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3BAEA0] hover:bg-[#329b91]"
            }`}
        >
          <FileDown className="w-5 h-5" />
          {descargando ? "Descargando..." : "Descargar PDF"}
        </button>
      </div>
    </div>
  );
}
