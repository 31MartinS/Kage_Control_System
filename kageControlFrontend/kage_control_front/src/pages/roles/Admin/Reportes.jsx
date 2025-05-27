import { useState } from "react";
import { CalendarRange, BarChart3, RefreshCw, FileDown } from "lucide-react";

export default function Reportes() {
  const [fecha, setFecha] = useState("");
  const [filtro, setFiltro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [data, setData] = useState([]);

  const datosEjemplo = [
    { mesa: "M1", pedidos: 12, tiempo: "14 min" },
    { mesa: "M2", pedidos: 9, tiempo: "17 min" },
    { mesa: "M3", pedidos: 6, tiempo: "15 min" },
  ];

  const generarDatos = () => {
    setCargando(true);
    setTimeout(() => {
      setData(datosEjemplo);
      setCargando(false);
    }, 800);
  };

  const exportarCSV = () => {
    const filas = [["Mesa", "Pedidos", "Tiempo promedio"], ...data.map((d) => [d.mesa, d.pedidos, d.tiempo])];
    const csv = filas.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${fecha}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38] flex items-center gap-2">
        <BarChart3 className="w-6 h-6" /> Reportes del Sistema
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EADBC8] p-6 shadow space-y-4">
          <h2 className="text-lg font-semibold text-[#4D4D4D]">Reportes recientes</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                onClick={() => {
                  setFiltro("atencion");
                  setFecha(new Date().toISOString().split("T")[0]);
                  generarDatos();
                }}
                className="text-[#264653] hover:underline"
              >
                Resumen diario de atención
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setFiltro("estacion");
                  setFecha(new Date().toISOString().split("T")[0]);
                  generarDatos();
                }}
                className="text-[#264653] hover:underline"
              >
                Pedidos por estación de cocina
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setFiltro("tiempos");
                  setFecha(new Date().toISOString().split("T")[0]);
                  generarDatos();
                }}
                className="text-[#264653] hover:underline"
              >
                Reporte de tiempos promedio
              </button>
            </li>
          </ul>
          {/* BACKEND: Aquí se puede reemplazar por historial real de reportes del usuario */}
        </div>

        <div className="bg-white rounded-2xl border border-[#EADBC8] p-6 shadow space-y-4">
          <label className="block text-sm text-[#4D4D4D] font-medium mb-1">Seleccionar fecha</label>
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#264653]" />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-4 py-2 border border-[#EADBC8] rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
            />
          </div>

          <button
            onClick={generarDatos}
            disabled={!fecha || cargando}
            className="flex items-center gap-2 bg-[#264653] text-white px-5 py-2 rounded-full font-medium hover:bg-[#1b3540] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : "hidden"}`} />
            <span>{cargando ? "Cargando..." : "Generar reporte"}</span>
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EADBC8] p-6 shadow space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#4D4D4D]">
              Resultados del {fecha} ({filtro})
            </h3>
            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#2e968d] transition"
            >
              <FileDown className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs uppercase bg-[#FAE5D3] text-[#8D2E38]">
              <tr>
                <th className="px-4 py-2">Mesa</th>
                <th className="px-4 py-2">Pedidos</th>
                <th className="px-4 py-2">Tiempo promedio</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={i} className="bg-white border-b hover:bg-[#fdf4ec]">
                  <td className="px-4 py-2">{d.mesa}</td>
                  <td className="px-4 py-2">{d.pedidos}</td>
                  <td className="px-4 py-2">{d.tiempo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
