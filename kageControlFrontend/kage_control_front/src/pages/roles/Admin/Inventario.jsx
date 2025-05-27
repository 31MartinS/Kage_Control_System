import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

export default function Inventario() {
  const [productos, setProductos] = useState([
    { id: 1, nombre: "Arroz", stock: 25, unidad: "kg" },
    { id: 2, nombre: "Aceite", stock: 10, unidad: "litros" },
    { id: 3, nombre: "Papas", stock: 50, unidad: "kg" },
  ]);

  return (
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Inventario de Cocina
      </h1>

      <div className="flex justify-between items-center">
        <p className="text-[#4D4D4D]">Total de productos: {productos.length}</p>
        <button className="flex items-center space-x-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#329b91] transition">
          <PlusCircle className="w-5 h-5" />
          <span>Nuevo producto</span>
        </button>
      </div>

      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-[#264653] uppercase bg-[#EADBC8] rounded-t-lg">
          <tr>
            <th className="px-6 py-3 rounded-tl-2xl">Producto</th>
            <th className="px-6 py-3">Stock</th>
            <th className="px-6 py-3">Unidad</th>
            <th className="px-6 py-3 rounded-tr-2xl text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr
              key={p.id}
              className="bg-white border-b border-[#EADBC8] hover:bg-[#fdf4ec]"
            >
              <td className="px-6 py-4 font-medium text-[#4D4D4D]">
                {p.nombre}
              </td>
              <td className="px-6 py-4">{p.stock}</td>
              <td className="px-6 py-4">{p.unidad}</td>
              <td className="px-6 py-4 text-right">
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