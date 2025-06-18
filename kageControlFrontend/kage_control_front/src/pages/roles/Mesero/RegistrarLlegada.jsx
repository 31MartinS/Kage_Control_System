import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

const colors = {
  fondo: "bg-[#FFF8F0]",
  borde: "border-[#EADBC8]",
  principal: "bg-[#264653]",
  secundario: "bg-[#3BAEA0]",
  acento: "bg-[#F4A261]",
  error: "text-[#E76F51]",
  texto: "text-[#264653]",
  boton: "bg-[#264653] hover:bg-[#1b3540]",
  boton2: "bg-[#3BAEA0] hover:bg-[#329b91]",
};

// --- VALIDACIONES ---
function validarNombre(nombre) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,40}$/.test(nombre.trim());
}

function validarComensales(n) {
  const num = Number(n);
  return Number.isInteger(num) && num >= 1 && num <= 20;
}

function validarContacto(valor) {
  if (!valor) return true;
  const telefono = /^[0-9+() -]{7,20}$/;
  const email = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  return telefono.test(valor) || email.test(valor);
}

function validarUbicacion(txt) {
  return !txt || (txt.length <= 40);
}

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
  const [showModal, setShowModal] = useState(false);
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({
    nombre: false,
    comensales: false,
    contacto: false,
    ubicacion: false,
  });

  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await axiosClient.get("/tables");
        const libres = res.data.filter(
          (mesa) => mesa.status === "free" || mesa.status === "libre"
        );
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

  // VALIDACIONES DE ENTRADA
  useEffect(() => {
    setErrores({
      nombre: !validarNombre(form.nombre) ? "Solo letras, min. 3 caracteres" : "",
      comensales: !validarComensales(form.comensales) ? "Entre 1 y 20" : "",
      contacto: !validarContacto(form.contacto) ? "Teléfono o email válido" : "",
      ubicacion: !validarUbicacion(form.ubicacion) ? "Máx. 40 caracteres" : "",
    });
  }, [form]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? +value : value,
    }));
  };

  // Ahora con onBlur:
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
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

  // Al enviar, marca todos los campos como "touched"
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      nombre: true,
      comensales: true,
      contacto: true,
      ubicacion: true,
    });
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    setShowModal(false);
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

      setAvailableTables((prev) => prev.filter((id) => id !== mesaId));

      setForm({ nombre: "", comensales: 1, table_id: "", contacto: "", ubicacion: "" });
      setTouched({
        nombre: false,
        comensales: false,
        contacto: false,
        ubicacion: false,
      });
    } catch (err) {
      showToast("error", "Error al registrar llegada", parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const formInvalido =
    loading ||
    Object.values(errores).some((e) => e) ||
    !form.nombre ||
    !form.comensales;

  return (
    <div className={`${colors.fondo} p-10 rounded-3xl shadow-2xl border ${colors.borde} max-w-3xl mx-auto`}>
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#3BAEA0] tracking-tight font-sans">
        Registrar llegada de comensales
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="space-y-4 md:col-span-1">
          <label className="block text-[#264653] font-semibold">Nombre del cliente</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-sans"
            autoComplete="off"
          />
          {errores.nombre && touched.nombre && (
            <p className="text-[#E76F51] text-xs mt-1">{errores.nombre}</p>
          )}

          <label className="block text-[#264653] font-semibold">Número de comensales</label>
          <input
            name="comensales"
            type="number"
            min="1"
            max="20"
            value={form.comensales}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-sans"
          />
          {errores.comensales && touched.comensales && (
            <p className="text-[#E76F51] text-xs mt-1">{errores.comensales}</p>
          )}

          <label className="block text-[#264653] font-semibold">Mesa</label>
          <select
            name="table_id"
            value={form.table_id}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-sans"
          >
            <option value="">-- Mesa automática --</option>
            {availableTables.map((n) => (
              <option key={n} value={n}>Mesa {n}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 md:col-span-1">
          <label className="block text-[#264653] font-semibold">Contacto</label>
          <input
            name="contacto"
            value={form.contacto}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-sans"
          />
          {errores.contacto && touched.contacto && (
            <p className="text-[#E76F51] text-xs mt-1">{errores.contacto}</p>
          )}

          <label className="block text-[#264653] font-semibold">Preferencia de ubicación</label>
          <input
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-4 py-3 border border-[#EADBC8] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-sans"
          />
          {errores.ubicacion && touched.ubicacion && (
            <p className="text-[#E76F51] text-xs mt-1">{errores.ubicacion}</p>
          )}

          <button
            type="submit"
            disabled={formInvalido}
            className={`w-full py-3 mt-1 rounded-full font-semibold text-white text-lg tracking-wide transition font-sans shadow-lg ${
              formInvalido
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#3BAEA0] hover:bg-[#2f9b90]"
            }`}
          >
            {loading ? "Registrando..." : "Asignar mesa"}
          </button>

          {successMsg && (
            <p className="mt-4 text-center text-[#3BAEA0] font-semibold whitespace-pre-wrap font-sans">
              {successMsg}
            </p>
          )}
        </div>
      </form>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/0">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center font-sans border-2 border-[#3BAEA0]">
            <h2 className="text-2xl font-bold mb-4 text-[#264653] font-sans">¿Confirmar llegada?</h2>
            <ul className="mb-6 w-full text-left text-[#3BAEA0] text-base">
              <li><b>Cliente:</b> {form.nombre}</li>
              <li><b>Comensales:</b> {form.comensales}</li>
              {form.table_id && <li><b>Mesa:</b> {form.table_id}</li>}
              {form.contacto && <li><b>Contacto:</b> {form.contacto}</li>}
              {form.ubicacion && <li><b>Ubicación:</b> {form.ubicacion}</li>}
            </ul>
            <div className="flex gap-4 w-full">
              <button
                onClick={confirmSubmit}
                className="flex-1 py-2 rounded-full bg-[#3BAEA0] hover:bg-[#2f9b90] text-white font-semibold shadow transition"
                disabled={loading}
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-semibold shadow transition"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
