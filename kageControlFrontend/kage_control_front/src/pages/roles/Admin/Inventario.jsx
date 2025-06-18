import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  X,
  ChefHat,
  Package,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

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
    <main className="space-y-10 max-w-7xl mx-auto p-6 font-sans">
      <div className="md:flex md:space-x-6 space-y-6 md:space-y-0">
        {/* INVENTARIO */}
        <section className="flex-1 bg-[#FFF8F0] p-8 rounded-3xl shadow-2xl border-2 border-[#EADBC8] space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-[#3BAEA0] flex items-center gap-2 font-sans">
              <Package className="w-7 h-7" /> Inventario de Cocina
            </h1>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#3BAEA0] text-white px-5 py-2 rounded-full font-bold hover:bg-[#329b91] transition-all shadow"
            >
              <PlusCircle className="w-5 h-5" /> Añadir producto
            </button>
          </div>

          <table className="w-full text-base font-sans">
            <thead className="text-xs uppercase bg-[#EADBC8] text-[#264653]">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">Producto</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right rounded-tr-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((i) => (
                <tr key={i.id} className="bg-white border-b-2 border-[#EADBC8] hover:bg-[#f6f1ea] transition">
                  <td className="px-6 py-4 font-semibold">{i.name}</td>
                  <td className="px-6 py-4">{i.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setConfirmDeleteId(i.id)}
                      className="text-[#8D2E38] hover:text-[#731c2a] transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* MENÚ */}
        <section className="flex-1 bg-white rounded-3xl shadow-xl border-2 border-[#EADBC8] p-8 space-y-5">
          <h2 className="text-3xl font-extrabold text-[#3BAEA0] flex items-center gap-2 font-sans">
            <ChefHat className="w-7 h-7" /> Menú Disponible
          </h2>
          <ul className="space-y-4">
            {platillos.length === 0 ? (
              <p className="text-center text-gray-400">No hay platillos disponibles.</p>
            ) : (
              platillos.map(({ id, name, description, price }) => (
                <li
                  key={id}
                  className="p-5 border-2 border-[#EADBC8] rounded-2xl hover:shadow-lg transition bg-[#FFF8F0]"
                >
                  <h3 className="text-lg font-bold text-[#264653]">{name}</h3>
                  <p className="text-base text-gray-600">{description}</p>
                  <p className="font-bold text-[#3BAEA0]">${price}</p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* MODAL CREAR NUEVO INGREDIENTE */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-96 relative border-2 border-[#3BAEA0]"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-4 right-4 text-[#8D2E38] hover:text-[#5c131e] text-2xl font-bold"
              >
                <X className="w-7 h-7" />
              </button>
              <h2 className="text-xl font-bold mb-4 text-[#3BAEA0] flex items-center gap-2">
                <ClipboardList className="w-5 h-5" /> Nuevo Ingrediente
              </h2>
              <label className="block font-bold mb-1 text-[#264653]">Nombre</label>
              <input
                value={nuevoIngrediente.name}
                onChange={(e) =>
                  setNuevoIngrediente({ ...nuevoIngrediente, name: e.target.value })
                }
                className="w-full mb-4 px-4 py-2 border-2 border-[#EADBC8] rounded-xl bg-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                placeholder="Ej. Harina"
              />
              <label className="block font-bold mb-1 text-[#264653]">Stock</label>
              <input
                type="text"
                value={nuevoIngrediente.stock}
                onChange={(e) =>
                  setNuevoIngrediente({ ...nuevoIngrediente, stock: e.target.value })
                }
                className="w-full mb-6 px-4 py-2 border-2 border-[#EADBC8] rounded-xl bg-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#3BAEA0] font-semibold"
                placeholder="Ej. 20"
              />
              <button
                onClick={() => crearIngrediente()}
                disabled={loadingInv}
                className={`w-full py-2 rounded-full font-bold text-white shadow transition ${
                  loadingInv ? "bg-gray-400 cursor-not-allowed" : "bg-[#3BAEA0] hover:bg-[#2f9b91]"
                }`}
              >
                {loadingInv ? "Guardando..." : "Guardar"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DETECTAR SIMILAR */}
      <AnimatePresence>
        {ingredienteCoincidente && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white border-2 border-[#EADBC8] rounded-3xl shadow-2xl p-8 w-96 text-center"
            >
              <h2 className="text-xl font-bold text-[#8D2E38] mb-3">Ingrediente similar encontrado</h2>
              <p className="text-gray-700 mb-2">
                Ya existe un producto llamado <strong>{ingredienteCoincidente.name}</strong>.<br />
                ¿Deseas actualizar su stock o crear uno nuevo?
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={async () => {
                    setIngredienteCoincidente(null);
                    setModalOpen(false);
                    await crearIngrediente(true);
                  }}
                  className="flex-1 py-2 rounded-full bg-[#3BAEA0] text-white font-bold hover:bg-[#2f9b91] shadow"
                >
                  Actualizar Stock
                </button>
                <button
                  onClick={async () => {
                    setIngredienteCoincidente(null);
                    setModalOpen(false);
                    await crearIngrediente(true);
                  }}
                  className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-bold shadow"
                >
                  Crear nuevo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR CONFIRMACIÓN */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-8 w-96 border-2 border-[#E76F51]"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-[#E76F51] w-7 h-7" />
                <h3 className="text-xl font-bold text-[#8D2E38]">¿Eliminar producto?</h3>
              </div>
              <p className="text-base text-[#264653] mb-6">
                Esta acción eliminará el ingrediente del inventario.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-5 py-2 bg-gray-200 rounded-full hover:bg-gray-300 font-bold text-[#264653]"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarIngrediente}
                  className="px-5 py-2 bg-[#E76F51] text-white rounded-full hover:bg-[#d45a48] font-bold"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
