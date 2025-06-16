import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";
import {
  PlusCircle,
  Trash2,
  X,
  ChefHat,
  Package,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

export default function Inventario() {
  const [platillos, setPlatillos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({ name: "", stock: "" });
  const [ingredienteCoincidente, setIngredienteCoincidente] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);

  const cargarDatos = async () => {
    try {
      const [menu, ingredientes] = await Promise.all([
        axiosClient.get("/menu/available"),
        axiosClient.get("/ingredients"),
      ]);
      setPlatillos(menu.data);
      setIngredientes(ingredientes.data);
    } catch (error) {
      butterup.error("Error al cargar los datos del inventario.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const crearIngrediente = async (forzar = false) => {
    const parsedStock = Number(nuevoIngrediente.stock);
    const nombreNormalizado = normalizeText(nuevoIngrediente.name || "");

    if (!nombreNormalizado || isNaN(parsedStock) || parsedStock <= 0) {
      butterup.error("Completa todos los campos correctamente.");
      return;
    }

    if (loadingInv) return;

    const match = ingredientes.find(
      (ing) => normalizeText(ing.name) === nombreNormalizado
    );

    if (match && !forzar) {
      setIngredienteCoincidente(match);
      return;
    }

    setLoadingInv(true);

    try {
      await axiosClient.post("/ingredients", {
        name: nuevoIngrediente.name.trim(),
        stock: parsedStock,
      });

      butterup.success(
        match && !forzar
          ? "Stock actualizado para producto existente ✅"
          : "Ingrediente creado ✅"
      );

      setIngredienteCoincidente(null);
      setModalOpen(false);
      setNuevoIngrediente({ name: "", stock: "" });
      await cargarDatos();
    } catch {
      butterup.error("Error al guardar ingrediente");
    } finally {
      setLoadingInv(false);
    }
  };

  const eliminarIngrediente = async () => {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    try {
      await axiosClient.delete(`/ingredients/${id}`);
      butterup.success("Ingrediente eliminado 🗑️");
      await cargarDatos();
    } catch (err) {
      butterup.error("Error al eliminar ingrediente ❌");
    }
  };

  return (
    <main className="space-y-10 max-w-7xl mx-auto p-6">
      <div className="md:flex md:space-x-6 space-y-6 md:space-y-0">
        <section className="flex-1 bg-[#FFF8F0] p-6 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-serif font-bold text-[#8D2E38] flex items-center gap-2">
              <Package className="w-6 h-6" /> Inventario de Cocina
            </h1>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#329b91] transition"
            >
              <PlusCircle className="w-5 h-5" /> Añadir producto
            </button>
          </div>

          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs uppercase bg-[#EADBC8] text-[#264653]">
              <tr>
                <th className="px-6 py-3 rounded-tl-xl">Producto</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3 text-right rounded-tr-xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((i) => (
                <tr key={i.id} className="bg-white border-b hover:bg-[#fdf4ec]">
                  <td className="px-6 py-4">{i.name}</td>
                  <td className="px-6 py-4">{i.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(i.id)}
                      className="text-[#8D2E38] hover:text-[#731c2a]"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex-1 bg-white rounded-3xl shadow-lg border border-[#EADBC8] p-6 space-y-4">
          <h2 className="text-2xl font-serif font-bold text-[#8D2E38] flex items-center gap-2">
            <ChefHat className="w-6 h-6" /> Menú Disponible
          </h2>
          <ul className="space-y-4">
            {platillos.length === 0 ? (
              <p className="text-center text-gray-400">No hay platillos disponibles.</p>
            ) : (
              platillos.map(({ id, name, description, price }) => (
                <li
                  key={id}
                  className="p-4 border border-[#EADBC8] rounded-xl hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-[#264653]">{name}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                  <p className="font-bold text-[#3BAEA0]">${price}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* MODAL CREAR NUEVO INGREDIENTE */}
      {modalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-96 relative border border-[#EADBC8]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#8D2E38] hover:text-[#5c131e]"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-[#8D2E38] flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> Nuevo Ingrediente
            </h2>
            <label className="block font-medium mb-1">Nombre</label>
            <input
              value={nuevoIngrediente.name}
              onChange={(e) =>
                setNuevoIngrediente({ ...nuevoIngrediente, name: e.target.value })
              }
              className="w-full mb-4 px-3 py-2 border rounded"
              placeholder="Ej. Harina"
            />
            <label className="block font-medium mb-1">Stock</label>
            <input
              type="text"
              value={nuevoIngrediente.stock}
              onChange={(e) =>
                setNuevoIngrediente({ ...nuevoIngrediente, stock: e.target.value })
              }
              className="w-full mb-6 px-3 py-2 border rounded"
              placeholder="Ej. 20"
            />
            <button
              onClick={() => crearIngrediente()}
              disabled={loadingInv}
              className={`w-full py-2 rounded-full font-medium text-white transition ${
                loadingInv ? "bg-gray-400 cursor-not-allowed" : "bg-[#3BAEA0] hover:bg-[#2f9b91]"
              }`}
            >
              {loadingInv ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETECTAR SIMILAR */}
      {ingredienteCoincidente && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white border border-[#EADBC8] rounded-2xl shadow-xl p-8 w-96 text-center space-y-4">
            <h2 className="text-lg font-bold text-[#8D2E38]">Ingrediente similar encontrado</h2>
            <p className="text-gray-700">
              Ya existe un producto llamado <strong>{ingredienteCoincidente.name}</strong>.
              ¿Deseas actualizar su stock o crear uno nuevo?
            </p>
            <div className="flex justify-between gap-3 mt-4">
              <button
                onClick={async () => {
                  setIngredienteCoincidente(null);
                  setModalOpen(false);
                  await crearIngrediente(true);
                }}
                className="w-full py-2 rounded-full bg-[#3BAEA0] text-white hover:bg-[#2f9b91]"
              >
                Actualizar Stock
              </button>
              <button
                onClick={async () => {
                  setIngredienteCoincidente(null);
                  setModalOpen(false);
                  await crearIngrediente(true);
                }}
                className="w-full py-2 rounded-full bg-gray-300 hover:bg-gray-400"
              >
                Crear nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR CONFIRMACIÓN */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 border border-[#EADBC8]">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-[#E76F51] w-6 h-6" />
              <h3 className="text-lg font-bold text-[#8D2E38]">¿Eliminar producto?</h3>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Esta acción eliminará el ingrediente del inventario.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded-full hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarIngrediente}
                className="px-4 py-2 bg-[#E76F51] text-white rounded-full hover:bg-[#d45a48]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
