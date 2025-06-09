import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import { PlusCircle, Trash2, Pencil, X } from "lucide-react";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: "",
    full_name: "",
    email: "",
    phone: "",
    role: "mesero",
    hire_date: "",
    password: "",
  });

  useEffect(() => {
    axiosClient
      .get("/auth/users")
      .then((res) => {
        setUsuarios(res.data);
      })
      .catch((err) => {
        console.error("Error al obtener usuarios:", err);
      });
  }, []);

  const handleChange = (e) => {
    setNuevoUsuario({ ...nuevoUsuario, [e.target.name]: e.target.value });
  };

  const handleCrearUsuario = () => {
    axiosClient
      .post("/auth/register", nuevoUsuario)
      .then((res) => {
        setUsuarios([...usuarios, res.data]);
        butterup.toast({
          title: "Usuario creado",
          message: `El usuario ${res.data.full_name} fue creado exitosamente.`,
          type: "success",
        });
        setShowModal(false);
        setNuevoUsuario({
          username: "",
          full_name: "",
          email: "",
          phone: "",
          role: "mesero",
          hire_date: "",
          password: "",
        });
      })
      .catch((err) => {
        const errorMsg = err.response?.data?.detail || "Error al crear el usuario";
        butterup.toast({
          title: "Error",
          message: errorMsg,
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
          onClick={() => setShowModal(true)}
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
                <span className="px-3 py-1 text-xs rounded-full font-semibold shadow-sm bg-green-200 text-green-800">
                  Activo
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button className="text-[#264653] hover:text-[#1b3540]">
                  <Pencil className="w-5 h-5" />
                </button>
                <button className="text-[#8D2E38] hover:text-[#731c2a]">
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal sin oscurecer fondo */}
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
              Registrar Nuevo Usuario
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                className="input"
                value={nuevoUsuario.username}
                onChange={handleChange}
              />
              <input
                type="text"
                name="full_name"
                placeholder="Nombre completo"
                className="input"
                value={nuevoUsuario.full_name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                className="input"
                value={nuevoUsuario.email}
                onChange={handleChange}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                className="input"
                value={nuevoUsuario.phone}
                onChange={handleChange}
              />
              <select
                name="role"
                className="input"
                value={nuevoUsuario.role}
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
                value={nuevoUsuario.hire_date}
                onChange={handleChange}
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                className="input col-span-2"
                value={nuevoUsuario.password}
                onChange={handleChange}
              />
              <button
                onClick={handleCrearUsuario}
                className="col-span-2 bg-[#3BAEA0] text-white py-2 rounded-full hover:bg-[#329b91] transition font-medium"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
