import { useEffect, useState } from "react";
import axiosClient from "../../../api/axiosClient";
import {
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
  UtensilsCrossed,
  PieChart,
  CalendarDays,
  ListTree
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Pie,
  PieChart as RePieChart,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

export default function Reportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({
    reservas: true,
    meseros: false,
    ordenes: false,
    comensales: false,
  });

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/reports/dashboard");
      setData(res.data);
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-[#4D4D4D] font-semibold">
        Cargando estadísticas...
      </div>
    );
  }

  const COLORS = ["#3BAEA0", "#E76F51", "#F4A261", "#264653", "#A8DADC"];

  const { reservas, meseros, ordenes, comensales } = data;

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38] flex items-center gap-3">
        <BarChart3 className="w-7 h-7" /> Estadísticas del Sistema
      </h1>

      {/* Reservas */}
      <Section
        title="Estadísticas de Reservas"
        icon={<CalendarDays />}
        expanded={expanded.reservas}
        onToggle={() => toggle("reservas")}
      >
        <p className="mb-2 text-[#4D4D4D] font-medium">
          Duración promedio de estancia:{" "}
          <span className="font-bold">{reservas.duracion_promedio.toFixed(1)} min</span>
        </p>

        <h3 className="text-sm text-[#264653] font-semibold mt-4">Reservas por Día</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={Object.entries(reservas.por_dia).map(([k, v]) => ({ fecha: k, total: v }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3BAEA0" />
          </BarChart>
        </ResponsiveContainer>

        <h3 className="text-sm text-[#264653] font-semibold mt-4">Reservas por Estado</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RePieChart>
            <Pie
              data={Object.entries(reservas.por_estado).map(([k, v]) => ({ name: k, value: v }))}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
              dataKey="value"
            >
              {Object.entries(reservas.por_estado).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RePieChart>
        </ResponsiveContainer>
      </Section>

      {/* Meseros */}
      <Section
        title="Rendimiento del Personal"
        icon={<Users />}
        expanded={expanded.meseros}
        onToggle={() => toggle("meseros")}
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={meseros}>
            <XAxis dataKey="nombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ordenes" fill="#3BAEA0" name="Órdenes" />
            <Bar dataKey="ventas" fill="#E76F51" name="Ventas $" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Consumo */}
      <Section
        title="Órdenes y Consumo"
        icon={<UtensilsCrossed />}
        expanded={expanded.ordenes}
        onToggle={() => toggle("ordenes")}
      >
        <h3 className="text-sm text-[#264653] font-semibold mb-2">Top 10 Platos Más Vendidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={ordenes.top_platos}
            layout="vertical"
            margin={{ left: 80 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="nombre" type="category" />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#F4A261" />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* Comensales */}
      <Section
        title="Comensales y Grupos"
        icon={<ListTree />}
        expanded={expanded.comensales}
        onToggle={() => toggle("comensales")}
      >
        <p className="text-[#4D4D4D] font-medium mb-2">
          Tamaño promedio de grupo:{" "}
          <span className="font-bold">{comensales.tamano_promedio.toFixed(1)}</span>
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={Object.entries(comensales.por_dia).map(([k, v]) => ({ fecha: k, total: v }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#8D2E38" />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={cargarDatos}
          className="flex items-center gap-2 bg-[#3BAEA0] text-white px-6 py-2 rounded-full font-medium hover:bg-[#2d9c92] transition"
        >
          <RefreshCw className="w-5 h-5" /> Actualizar estadísticas
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, expanded, children, onToggle }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EADBC8] shadow-md">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex justify-between items-center text-left font-semibold text-[#264653] text-xl"
      >
        <div className="flex items-center gap-3">
          {icon}
          {title}
        </div>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </button>
      {expanded && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
