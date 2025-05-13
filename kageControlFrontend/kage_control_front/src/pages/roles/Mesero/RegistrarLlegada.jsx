// src/pages/roles/Mesero/RegistrarLlegada.jsx
import { useState } from "react";

export default function RegistrarLlegada() {
  const availableTables = Array.from({ length: 10 }, (_, i) => i + 1);

  const [form, setForm] = useState({
    nombre: "",
    comensales: 1,
    mesa: "",
    contacto: "",
    ubicacion: "",
    hora: new Date().toISOString().slice(0, 16), // yyyy-MM-ddThh:mm
  });
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí enviarías `form` al backend...
    setSuccessMsg(
      `Mesa ${form.mesa} asignada a ${form.comensales} comensal(es).`
    );
    // Opcional: limpiar formulario (menos hora)
    setForm((f) => ({
      nombre: "",
      comensales: 1,
      mesa: "",
      contacto: "",
      ubicacion: "",
      hora: f.hora,
    }));
  };

  return (
    <div className="bg-[#F3F4F6] p-6 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[#184B6B] mb-6">
        Registrar llegada de comensales
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
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

          {/* Nº Comensales */}
          <div>
            <label className="block text-[#1F2937] mb-1">
              # de comensales
            </label>
            <input
              name="comensales"
              type="number"
              min="1"
              value={form.comensales}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>

          {/* Seleccionar mesa */}
          <div>
            <label className="block text-[#1F2937] mb-1">Mesa</label>
            <select
              name="mesa"
              value={form.mesa}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-white focus:outline-none"
            >
              <option value="">-- Elige una mesa --</option>
              {availableTables.map((n) => (
                <option key={n} value={n}>
                  Mesa {n}
                </option>
              ))}
            </select>
          </div>

          {/* Hora llegada */}
          <div>
            <label className="block text-[#1F2937] mb-1">Hora llegada</label>
            <input
              name="hora"
              type="datetime-local"
              value={form.hora}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>

          {/* Contacto */}
          <div className="md:col-span-2">
            <label className="block text-[#1F2937] mb-1">Contacto (opcional)</label>
            <input
              name="contacto"
              value={form.contacto}
              onChange={handleChange}
              placeholder="Teléfono o email"
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>

          {/* Ubicación */}
          <div className="md:col-span-2">
            <label className="block text-[#1F2937] mb-1">Preferencia ubicación</label>
            <input
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="Ventana, interior, cerca de cocina..."
              className="w-full p-2 border rounded bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full py-3 bg-[#3BAEA0] hover:bg-[#32A291] text-white rounded-lg font-semibold transition"
        >
          Asignar mesa
        </button>

        {/* Mensaje de éxito */}
        {successMsg && (
          <p className="mt-4 text-center text-[#184B6B] font-medium">
            {successMsg}
          </p>
        )}
      </form>
    </div>
  );
}
