import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { PlusCircle, Trash2, Pencil, X } from "lucide-react";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioEditandoId, setUsuarioEditandoId] = useState(null);

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

  const abrirModalCrear = () => {
    setEditando(false);
    setFormUsuario({
      username: "",
      full_name: "",
      email: "",
      phone: "",
      role: "mesero",
      hire_date: "",
      password: "",
      estado: "activo",
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
    setShowModal(true);
  };

  const handleCrearUsuario = () => {
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

  const handleEliminarUsuario = (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    axiosClient
      .delete(`/auth/users/${id}`)
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
      });
  };

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6 relative">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Gestión de Usuarios</h1>

      <div className="flex justify-between items-center">
        <p className="text-[#4D4D4D]">Usuarios registrados: {usuarios.length}</p>
        <button
          onClick={abrirModalCrear}
          className="flex items-center gap-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#329b91] transition"
        >
          <PlusCircle className="w-5 h-5" />
          Añadir usuario
        </button>
      </div>

      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-[#EADBC8] text-[#264653]">
          <tr>
            <th className="px-6 py-3 rounded-tl-2xl">Nombre</th>
            <th className="px-6 py-3">Rol</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3 text-right rounded-tr-2xl">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="bg-white border-b border-[#EADBC8] hover:bg-[#fdf4ec]">
              <td className="px-6 py-4 font-medium">{u.full_name}</td>
              <td className="px-6 py-4 capitalize">{u.role}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm 
                  ${u.estado === "inactivo" ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
                  {u.estado === "inactivo" ? "Inactivo" : "Activo"}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  className="text-[#264653] hover:text-[#1b3540]"
                  onClick={() => abrirModalEditar(u)}
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  className="text-[#8D2E38] hover:text-[#731c2a]"
                  onClick={() => handleEliminarUsuario(u.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-start z-50 pt-16">
          <div className="bg-white w-full max-w-xl p-8 rounded-3xl shadow-2xl border border-[#EADBC8] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#8D2E38] hover:text-[#5c131e]"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-[#8D2E38] mb-6 border-b pb-2">
              {editando ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                className="input"
                value={formUsuario.username}
                onChange={handleChange}
                disabled={editando}
              />
              <input
                type="text"
                name="full_name"
                placeholder="Nombre completo"
                className="input"
                value={formUsuario.full_name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="input"
                value={formUsuario.email}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                className="input"
                value={formUsuario.phone}
                onChange={handleChange}
              />
              <select
                name="role"
                className="input"
                value={formUsuario.role}
                onChange={handleChange}
              >
                <option value="mesero">Mesero</option>
                <option value="cocina">Cocina</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="date"
                name="hire_date"
                className="input"
                value={formUsuario.hire_date}
                onChange={handleChange}
              />
              {!editando && (
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  className="input col-span-2"
                  value={formUsuario.password}
                  onChange={handleChange}
                />
              )}
              <select
                name="estado"
                className="input"
                value={formUsuario.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <button
                onClick={editando ? handleActualizarUsuario : handleCrearUsuario}
                className="col-span-2 bg-[#3BAEA0] text-white py-2 rounded-full hover:bg-[#329b91] transition font-medium"
              >
                {editando ? "Guardar Cambios" : "Crear Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
