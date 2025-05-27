import { useState } from "react";
import { PlusCircle, Trash2, Pencil } from "lucide-react";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: "Juan Pérez", rol: "mesero", activo: true },
    { id: 2, nombre: "María López", rol: "admin", activo: true },
    { id: 3, nombre: "Carlos Ruiz", rol: "cocina", activo: false },
  ]);

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Gestión de Usuarios</h1>

      <div className="flex justify-between items-center">
        <p className="text-[#4D4D4D]">Usuarios registrados: {usuarios.length}</p>
        <button className="flex items-center gap-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#329b91] transition">
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
              <td className="px-6 py-4 font-medium">{u.nombre}</td>
              <td className="px-6 py-4 capitalize">{u.rol}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 text-xs rounded-full font-semibold shadow-sm ${
                    u.activo ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                  }`}
                >
                  {u.activo ? "Activo" : "Inactivo"}
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
    </div>
  );
}
