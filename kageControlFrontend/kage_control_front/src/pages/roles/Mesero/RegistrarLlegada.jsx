// src/pages/roles/Mesero/RegistrarLlegada.jsx
import { useState } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function RegistrarLlegada() {
  const availableTables = Array.from({ length: 12 }, (_, i) => i + 1);

  const [form, setForm] = useState({
    nombre: "",
    comensales: 1,
    table_id: "",
    contacto: "",
    ubicacion: "",
  });

  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const showToast = (type, title, message) => {
    butterup.toast({
      title,
      message,
      location: "top-right",
      icon: false,
      dismissable: true,
      type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSuccessMsg("");

    // Validaciones
    if (!form.nombre.trim() || form.nombre.trim().length < 3) {
      showToast("error", "Nombre inválido", "El nombre debe tener al menos 3 caracteres.");
      return;
    }

    const numComensales = parseInt(form.comensales);
    if (isNaN(numComensales) || numComensales < 1 || numComensales > 20) {
      showToast("error", "Número inválido", "Ingrese entre 1 y 20 comensales.");
      return;
    }

    if (form.table_id && !availableTables.includes(Number(form.table_id))) {
      showToast("error", "Mesa inválida", "Seleccione una mesa válida.");
      return;
    }

    if (
      form.contacto &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contacto) &&
      !/^\+?[0-9\s\-]{7,15}$/.test(form.contacto)
    ) {
      showToast("error", "Contacto inválido", "Ingrese un email o número de teléfono válido.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customer_name: form.nombre.trim(),
        party_size: numComensales,
        contact: form.contacto.trim() || undefined,
        preferences: form.ubicacion.trim() || undefined,
        ...(form.table_id && { table_id: +form.table_id }),
      };

      const res = await axiosClient.post("/arrivals", payload);

      const mesaId = res.data.table_id;
      const at = new Date(res.data.assigned_at).toLocaleTimeString();
      const msg = `Mesa ${mesaId} asignada a ${numComensales} comensal(es). Llegada registrada a las ${at}.`;

      setSuccessMsg(msg);
      showToast("success", "Llegada registrada", msg);

      setForm({
        nombre: "",
        comensales: 1,
        table_id: "",
        contacto: "",
        ubicacion: "",
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const text = Array.isArray(detail)
        ? detail.map((d) => d.msg).join("; ")
        : detail || "Error al registrar llegada";

      showToast("error", "Error al registrar llegada", text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[#184B6B] mb-6">
        Registrar llegada de comensales
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[#1F2937] mb-1">Nombre cliente</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej. Juan Pérez"
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#1F2937] mb-1">
              # de comensales
            </label>
            <input
              name="comensales"
              type="number"
              min="1"
              max="20"
              value={form.comensales}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#1F2937] mb-1">Mesa (opcional)</label>
            <select
              name="table_id"
              value={form.table_id}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white focus:outline-none"
            >
              <option value="">-- Dejar asignación automática --</option>
              {availableTables.map((n) => (
                <option key={n} value={n}>
                  Mesa {n}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#1F2937] mb-1">
              Contacto (opcional)
            </label>
            <input
              name="contacto"
              value={form.contacto}
              onChange={handleChange}
              placeholder="Teléfono o email"
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#1F2937] mb-1">
              Preferencia ubicación (opcional)
            </label>
            <input
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="Ventana, interior, cerca de cocina..."
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-[#3BAEA0] hover:bg-[#32A291] text-white rounded-lg font-semibold transition disabled:opacity-50"
        >
          {isSubmitting ? "Registrando..." : "Asignar mesa"}
        </button>

        {successMsg && (
          <p className="mt-4 text-center text-[#184B6B] font-medium whitespace-pre-wrap">
            {successMsg}
          </p>
        )}
      </form>
    </div>
  );
}
