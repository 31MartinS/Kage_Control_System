import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { PlusCircle, Trash2, Pencil, X } from "lucide-react";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);

  // Modal gourmet para eliminar
  const [usuarioEliminarId, setUsuarioEliminarId] = useState(null);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);

  const [formUsuario, setFormUsuario] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    role: "mesero",
    hire_date: "",
    password: "",
    estado: "activo",
  });

  // ---- VALIDACIONES ----
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({
    username: false,
    full_name: false,
    email: false,
    phone: false,
    password: false,
    hire_date: false,
  });

  function validarUsuario(f) {
    const hoy = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const minFecha = "2000-01-01";

    return {
      username: (!/^[\w.-]{3,20}$/.test(f.username)) ? "3-20 letras/números/._-" : "",
      full_name: (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,40}$/.test(f.full_name.trim())) ? "Solo letras, min. 3" : "",
      email: (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(f.email)) ? "Correo inválido" : "",
      phone: (!!f.phone && !/^[0-9+() -]{7,20}$/.test(f.phone)) ? "Teléfono inválido" : "",
      password: (!editando && (!f.password || f.password.length < 6)) ? "Mín. 6 caracteres" : "",
      hire_date: (!f.hire_date)
        ? "Fecha requerida"
        : (f.hire_date > hoy)
          ? "No puede ser futura"
          : (f.hire_date < minFecha)
            ? `No anterior a ${minFecha}`
            : "",
    };
  }

  useEffect(() => {
    setErrores(validarUsuario(formUsuario));
  }, [formUsuario, editando]);

  // ----------------------

  const fetchUsuarios = () => {
    axiosClient
      .get("/auth/users")
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error("Error al obtener usuarios:", err));
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormUsuario({ ...formUsuario, [e.target.name]: e.target.value });
  };

  // Marca el campo como tocado
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const abrirModalCrear = () => {
    setEditando(false);
    setFormUsuario({
      username: "",
      full_name: "",
      email: "",
      phone: "",
      role: "mesero",
      hire_date: new Date().toISOString().split("T")[0],
      password: "",
      estado: "activo",
    });
    setTouched({
      username: false,
      full_name: false,
      email: false,
      phone: false,
      password: false,
    });
    setShowModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setEditando(true);
    setUsuarioEditandoId(usuario.id);
    setFormUsuario({
      username: usuario.username,
      full_name: usuario.full_name,
      email: usuario.email,
      phone: usuario.phone,
      role: usuario.role,
      hire_date: usuario.hire_date,
      password: "",
      estado: usuario.estado || "activo",
    });
    setTouched({
      username: false,
      full_name: false,
      email: false,
      phone: false,
      password: false,
    });
    setShowModal(true);
  };

  // Modal gourmet de eliminación
  const abrirModalEliminar = (id) => {
    setUsuarioEliminarId(id);
    setModalEliminarOpen(true);
  };

  const confirmarEliminarUsuario = () => {
    axiosClient
      .delete(`/auth/users/${usuarioEliminarId}`)
      .then(() => {
        butterup.toast({
          title: "Usuario eliminado",
          message: "El usuario fue eliminado correctamente.",
          type: "success",
        });
        fetchUsuarios();
      })
      .catch((err) => {
        butterup.toast({
          title: "Error",
          message: err.response?.data?.detail || "Error al eliminar",
          type: "error",
        });
      })
      .finally(() => {
        setModalEliminarOpen(false);
        setUsuarioEliminarId(null);
      });
  };

  // Al intentar guardar, marca todos los campos como tocados
  const marcarTodosTouched = () => {
    setTouched({
      username: true,
      full_name: true,
      email: true,
      phone: true,
      password: true,
      hire_date: true, 
    });
  };

  const handleCrearUsuario = () => {
    marcarTodosTouched();
    if (Object.values(errores).some((e) => e) ||
      !formUsuario.username ||
      !formUsuario.full_name ||
      !formUsuario.email ||
      !formUsuario.password) return;
    axiosClient
      .post("/auth/register", formUsuario)
      .then((res) => {
        butterup.toast({
          title: "Usuario creado",
          message: `El usuario ${res.data.full_name} fue creado exitosamente.`,
          type: "success",
        });
        setShowModal(false);
        fetchUsuarios();
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.detail || "Error al crear el usuario";
        butterup.toast({ title: "Error", message: errorMsg, type: "error" });
      });
  };

  const handleActualizarUsuario = () => {
    marcarTodosTouched();
    if (Object.values(errores).some((e) => e) ||
      !formUsuario.username ||
      !formUsuario.full_name ||
      !formUsuario.email) return;
    axiosClient
      .patch(`/auth/users/${usuarioEditandoId}`, formUsuario)
      .then(() => {
        butterup.toast({
          title: "Usuario actualizado",
          message: `Cambios guardados correctamente.`,
          type: "success",
        });
        setShowModal(false);
        fetchUsuarios();
      })
      .catch((err) => {
        butterup.toast({
          title: "Error",
          message: err.response?.data?.detail || "Error al actualizar",
          type: "error",
        });
      });
  };

  const formularioInvalido =
    Object.values(errores).some((e) => e) ||
    !formUsuario.username ||
    !formUsuario.full_name ||
    !formUsuario.email ||
    (!editando && !formUsuario.password);

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-5xl mx-auto space-y-10 font-sans min-h-[70vh] relative">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight">
        Gestión de Usuarios
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[#264653] font-semibold font-sans">
          Usuarios registrados: {usuarios.length}
        </p>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 bg-[#3BAEA0] text-white px-5 py-2 rounded-full font-bold hover:bg-[#329b91] shadow transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Añadir usuario
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-base font-sans">
          <thead className="text-xs uppercase bg-[#EADBC8] text-[#264653]">
            <tr>
              <th className="px-6 py-4 rounded-tl-2xl">Nombre</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right rounded-tr-2xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                className="bg-white border-b-2 border-[#EADBC8] hover:bg-[#f6f1ea] transition"
              >
                <td className="px-6 py-4 font-semibold">{u.full_name}</td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-bold shadow
                      ${u.estado === "inactivo"
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"}
                    `}
                  >
                    {u.estado === "inactivo" ? "Inactivo" : "Activo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    className="text-[#264653] hover:text-[#1b3540] transition"
                    onClick={() => abrirModalEditar(u)}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    className="text-[#8D2E38] hover:text-[#731c2a] transition"
                    onClick={() => abrirModalEliminar(u.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal gourmet crear/editar */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-xl p-10 rounded-3xl shadow-2xl border-2 border-[#3BAEA0]"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-[#8D2E38] hover:text-[#5c131e] text-2xl font-bold transition"
              >
                <X className="w-7 h-7" />
              </button>
              <h2 className="text-2xl font-bold text-[#3BAEA0] mb-8 border-b pb-2 text-center">
                {editando ? "Editar Usuario" : "Registrar Nuevo Usuario"}
              </h2>
              <div className="grid grid-cols-2 gap-5 font-sans">
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Usuario"
                    className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                    value={formUsuario.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={editando}
                  />
                  {errores.username && touched.username && (
                    <p className="text-[#E76F51] text-xs mt-1">{errores.username}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Nombre completo"
                    className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                    value={formUsuario.full_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errores.full_name && touched.full_name && (
                    <p className="text-[#E76F51] text-xs mt-1">{errores.full_name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                    value={formUsuario.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errores.email && touched.email && (
                    <p className="text-[#E76F51] text-xs mt-1">{errores.email}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Teléfono"
                    className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                    value={formUsuario.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errores.phone && touched.phone && (
                    <p className="text-[#E76F51] text-xs mt-1">{errores.phone}</p>
                  )}
                </div>
                <select
                  name="role"
                  className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  value={formUsuario.role}
                  onChange={handleChange}
                >
                  <option value="mesero">Mesero</option>
                  <option value="cocina">Cocina</option>
                  <option value="admin">Admin</option>
                </select>
                <div>
                <input
                  type="date"
                  name="hire_date"
                  className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  value={formUsuario.hire_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errores.hire_date && touched.hire_date && (
                  <p className="text-[#E76F51] text-xs mt-1">{errores.hire_date}</p>
                )}
                </div>
                {!editando && (
                  <div className="col-span-2">
                    <input
                      type="password"
                      name="password"
                      placeholder="Contraseña"
                      className="input w-full bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                      value={formUsuario.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errores.password && touched.password && (
                      <p className="text-[#E76F51] text-xs mt-1">{errores.password}</p>
                    )}
                  </div>
                )}
                <select
                  name="estado"
                  className="input bg-[#FFF8F0] border-2 border-[#EADBC8] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                  value={formUsuario.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <button
                  onClick={editando ? handleActualizarUsuario : handleCrearUsuario}
                  type="button"
                  disabled={formularioInvalido}
                  className={`col-span-2 py-3 rounded-full font-bold shadow mt-2 transition ${
                    formularioInvalido
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-[#3BAEA0] hover:bg-[#329b91] text-white"
                  }`}
                >
                  {editando ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal gourmet para eliminar usuario */}
      <AnimatePresence>
        {modalEliminarOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl border-2 border-[#8D2E38]"
            >
              <button
                onClick={() => setModalEliminarOpen(false)}
                className="absolute top-3 right-4 text-[#8D2E38] hover:text-[#5c131e] text-2xl font-bold transition"
              >
                <X className="w-7 h-7" />
              </button>
              <h2 className="text-2xl font-bold text-[#8D2E38] mb-6 text-center">¿Eliminar usuario?</h2>
              <p className="text-[#264653] text-center mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={confirmarEliminarUsuario}
                  className="flex-1 py-2 rounded-full bg-[#8D2E38] hover:bg-[#731c2a] text-white font-bold shadow transition"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setModalEliminarOpen(false)}
                  className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-bold shadow transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
