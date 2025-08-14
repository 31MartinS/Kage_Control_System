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

  const limpiarFormulario = () => {
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
    
    console.log("Form data:", formUsuario);
    console.log("Errores:", errores);
    
    if (Object.values(errores).some((e) => e) ||
      !formUsuario.username ||
      !formUsuario.full_name ||
      !formUsuario.email ||
      !formUsuario.password) {
        console.log("Validación falló");
        butterup.toast({
          title: "Error de validación",
          message: "Por favor completa todos los campos requeridos.",
          type: "error",
          dismissable: true
        });
        return;
    }
    
    axiosClient
      .post("/auth/register", formUsuario)
      .then((res) => {
        console.log("Usuario creado:", res.data);
        butterup.toast({
          title: "Usuario creado",
          message: `El usuario ${res.data.full_name} fue creado exitosamente.`,
          type: "success",
          dismissable: true
        });
        setShowModal(false);
        fetchUsuarios();
        limpiarFormulario();
      })
      .catch((err) => {
        console.error("Error al crear usuario:", err);
        const errorMsg = err.response?.data?.detail || "Error al crear el usuario";
        butterup.toast({ 
          title: "Error", 
          message: errorMsg, 
          type: "error",
          dismissable: true 
        });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 text-lg">
                Administra el equipo de trabajo de tu restaurante
              </p>
            </div>
            <button
              onClick={abrirModalCrear}
              className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Agregar Usuario
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900">{usuarios.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <PlusCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {usuarios.filter(u => u.estado === 'activo').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <PlusCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Meseros</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {usuarios.filter(u => u.role === 'mesero').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <PlusCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administradores</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {usuarios.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <PlusCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Lista de Usuarios</h2>
            <p className="text-gray-600 text-sm">Gestiona los miembros de tu equipo</p>
          </div>

          <div className="p-6">
            {usuarios.length === 0 ? (
              <div className="text-center py-12">
                <PlusCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No hay usuarios</p>
                <p className="text-gray-500">Comienza agregando tu primer usuario</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {usuarios.map((usuario) => (
                    <motion.div
                      key={usuario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            usuario.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{usuario.full_name}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                usuario.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-700'
                                  : usuario.role === 'mesero'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {usuario.role}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                usuario.estado === 'activo' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {usuario.estado}
                              </span>
                              {usuario.email && (
                                <span className="text-xs text-gray-500">{usuario.email}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirModalEditar(usuario)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirModalEliminar(usuario.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editando ? "Editar Usuario" : "Nuevo Usuario"}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario
                      </label>
                      <input
                        type="text"
                        value={formUsuario.username}
                        onChange={(e) => setFormUsuario({ ...formUsuario, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Nombre de usuario"
                        autoComplete="username"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={formUsuario.full_name}
                        onChange={(e) => setFormUsuario({ ...formUsuario, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ingresa el nombre completo"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formUsuario.email}
                        onChange={(e) => setFormUsuario({ ...formUsuario, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="usuario@email.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    {!editando && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña
                        </label>
                        <input
                          type="password"
                          value={formUsuario.password}
                          onChange={(e) => setFormUsuario({ ...formUsuario, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Contraseña segura"
                          autoComplete="new-password"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <select
                        value={formUsuario.role}
                        onChange={(e) => setFormUsuario({ ...formUsuario, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Selecciona un rol</option>
                        <option value="admin">Administrador</option>
                        <option value="mesero">Mesero</option>
                        <option value="cocina">Cocina</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={formUsuario.estado}
                        onChange={(e) => setFormUsuario({ ...formUsuario, estado: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={editando ? handleActualizarUsuario : handleCrearUsuario}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                      >
                        {editando ? "Actualizar" : "Crear Usuario"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
