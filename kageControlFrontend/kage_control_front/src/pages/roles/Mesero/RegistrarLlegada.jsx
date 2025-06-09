import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function RegistrarLlegada() {
  const [availableTables, setAvailableTables] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    comensales: 1,
    table_id: "",
    contacto: "",
    ubicacion: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar mesas libres desde backend al cargar el componente
  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await axiosClient.get("/tables"); // <-- ajustar según tu API
        // Suponemos que res.data es un array de mesas con estructura { id, status }
        const libres = res.data.filter((mesa) => mesa.status === "free" || mesa.status === "libre");
        setAvailableTables(libres.map((m) => m.id));
      } catch (error) {
        butterup.toast({
          title: "Error al cargar mesas",
          message: "No se pudieron obtener las mesas disponibles",
          location: "top-right",
          type: "error",
        });
      }
    }

    fetchTables();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? +value : value,
    }));
  };

  const showToast = (type, title, message) => {
    butterup.toast({ title, message, location: "top-right", icon: false, dismissable: true, type });
  };

  const parseError = (err) => {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((d) => d.msg).join("; ");
    return detail || "Error al registrar llegada";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {
        customer_name: form.nombre,
        party_size: form.comensales,
        contact: form.contacto || undefined,
        preferences: form.ubicacion || undefined,
        ...(form.table_id && { table_id: +form.table_id }),
      };

      const res = await axiosClient.post("/arrivals", payload);

      const mesaId = res.data.table_id;
      const at = new Date(res.data.assigned_at).toLocaleTimeString();
      const msg = `Mesa ${mesaId} asignada a ${form.comensales} comensal(es). Llegada registrada a las ${at}.`;

      setSuccessMsg(msg);
      showToast("success", "Llegada registrada", msg);

      // Actualizar lista de mesas disponibles tras asignación
      setAvailableTables((prev) => prev.filter((id) => id !== mesaId));

      setForm({ nombre: "", comensales: 1, table_id: "", contacto: "", ubicacion: "" });
    } catch (err) {
      showToast("error", "Error al registrar llegada", parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFF8F0] p-10 rounded-3xl shadow-xl border border-[#EADBC8] max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38] mb-8 text-center">
        Registrar llegada de comensales
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-1">
          <label className="block text-[#4D4D4D] font-medium">Nombre del cliente</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />

          <label className="block text-[#4D4D4D] font-medium">Número de comensales</label>
          <input
            name="comensales"
            type="number"
            min="1"
            max="20"
            value={form.comensales}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />

          <label className="block text-[#4D4D4D] font-medium">Mesa (opcional)</label>
          <select
            name="table_id"
            value={form.table_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          >
            <option value="">-- Mesa automática --</option>
            {availableTables.map((n) => (
              <option key={n} value={n}>Mesa {n}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 md:col-span-1">
          <label className="block text-[#4D4D4D] font-medium">Contacto (opcional)</label>
          <input
            name="contacto"
            value={form.contacto}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />

          <label className="block text-[#4D4D4D] font-medium">Preferencia de ubicación (opcional)</label>
          <input
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-1 rounded-full font-semibold text-white transition ${
              loading ? "bg-gray-400" : "bg-[#264653] hover:bg-[#1b3540]"
            }`}
          >
            {loading ? "Registrando..." : "Asignar mesa"}
          </button>

          {successMsg && (
            <p className="mt-4 text-center text-[#3BAEA0] font-medium whitespace-pre-wrap">
              {successMsg}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
