import { useState } from "react";
import { FileDown, CalendarRange, SlidersHorizontal } from "lucide-react";
import axios from "axios";

export function Informes() {
  const [filtro, setFiltro] = useState("atencion");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const downloadPdf = async () => {
    if (!desde || !hasta) {
      alert("Debes seleccionar fechas 'Desde' y 'Hasta'.");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8000/reports/attendance/pdf?start=${encodeURIComponent(
          desde
        )}&end=${encodeURIComponent(hasta)}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error descargando el informe:", error);
      alert("Ocurrió un error al generar el PDF.");
    }
  };

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Generar Informes
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tipo de informe */}
        <div>
          <label className="block mb-1 text-[#4D4D4D] font-medium">
            Tipo de informe
          </label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-full px-4 py-2 border border-[#EADBC8] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          >
            <option value="atencion">Atención por mesa</option>
            {/* Agrega más opciones cuando implementes otros endpoints */}
          </select>
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

      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={downloadPdf}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#264653] text-white font-medium hover:bg-[#1b3540] transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Generar vista previa
        </button>
        <button
          onClick={downloadPdf}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#3BAEA0] text-white font-medium hover:bg-[#329b91] transition"
        >
          <FileDown className="w-4 h-4" />
          Exportar informe
        </button>
      </div>
    </div>
  );
}

export default Informes;
