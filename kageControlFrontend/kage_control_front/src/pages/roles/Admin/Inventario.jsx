import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient"; // Ajusta según ruta real
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";
import { PlusCircle, Trash2, X } from "lucide-react";

export default function CocinaMenuInventario() {
  // Estado para menú
  const [platillos, setPlatillos] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Estado para inventario
  const [ingredientes, setIngredientes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({
    name: "",
    stock: 0,
  });
  const [loadingInv, setLoadingInv] = useState(false);

  // Carga menú disponible
  useEffect(() => {
    setLoadingMenu(true);
    axiosClient.get("/menu/available")
      .then(({ data }) => setPlatillos(data))
      .catch(() => butterup.error("Error al cargar el menú"))
      .finally(() => setLoadingMenu(false));
  }, []);

  // Carga ingredientes
  useEffect(() => {
    axiosClient.get("/ingredients")
      .then(({ data }) => setIngredientes(data))
      .catch(() => butterup.error("Error cargando ingredientes"));
  }, []);

  // Crear nuevo ingrediente
  const crearIngrediente = async () => {
    if (!nuevoIngrediente.name || nuevoIngrediente.stock <= 0) {
      butterup.error("Completa todos los campos correctamente.");
      return;
    }
    setLoadingInv(true);
    try {
      const { data } = await axiosClient.post("/ingredients", {
        name: nuevoIngrediente.name,
        stock: nuevoIngrediente.stock,
      });
      setIngredientes([...ingredientes, data]);
      setNuevoIngrediente({ name: "", stock: 0 });
      setModalOpen(false);
      butterup.success("Ingrediente creado correctamente");
    } catch (error) {
      butterup.error("Error al crear ingrediente");
    }
    setLoadingInv(false);
  };

  // Eliminar ingrediente
  const eliminarIngrediente = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este ingrediente?")) return;
    try {
      // Aquí implementar eliminación real si tienes endpoint:
      // await axiosClient.delete(`/ingredients/${id}`);

      // Mientras, solo lo borramos del estado
      setIngredientes(ingredientes.filter(i => i.id !== id));
      butterup.success("Ingrediente eliminado");
    } catch {
      butterup.error("Error al eliminar ingrediente");
    }
  };

  return (
    <main className="space-y-16 max-w-6xl mx-auto p-6">

      {/* Sección Menú */}
      <section className="bg-white rounded-3xl shadow-lg border border-[#EADBC8] p-8">
        <h2 className="text-3xl font-serif font-bold text-[#8D2E38] mb-6">Menú Disponible</h2>
        {loadingMenu ? (
          <p className="text-center text-gray-500">Cargando platillos...</p>
        ) : (
          <ul className="space-y-5">
            {platillos.length === 0 ? (
              <p className="text-center text-gray-400">No hay platillos disponibles.</p>
            ) : (
              platillos.map(({ id, name, description, price }) => (
                <li
                  key={id}
                  className="p-4 border border-[#EADBC8] rounded-xl hover:shadow-md transition cursor-default"
                >
                  <h3 className="text-xl font-semibold text-[#264653]">{name}</h3>
                  <p className="text-gray-600 mt-1">{description}</p>
                  <p className="mt-2 font-bold text-[#3BAEA0]">${price} $</p>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      {/* Sección Inventario */}
      <section className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Inventario de Cocina</h1>

        <div className="flex justify-between items-center">
          <p className="text-[#4D4D4D]">Total de productos: {ingredientes.length}</p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-2 bg-[#3BAEA0] text-white px-4 py-2 rounded-full font-medium hover:bg-[#329b91] transition"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nuevo producto</span>
          </button>
        </div>

        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-[#264653] uppercase bg-[#EADBC8] rounded-t-lg">
            <tr>
              <th className="px-6 py-3 rounded-tl-2xl">Producto</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3 rounded-tr-2xl text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map((i) => (
              <tr key={i.id} className="bg-white border-b border-[#EADBC8] hover:bg-[#fdf4ec]">
                <td className="px-6 py-4 font-medium text-[#4D4D4D]">{i.name}</td>
                <td className="px-6 py-4">{i.stock}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => eliminarIngrediente(i.id)}
                    className="text-[#8D2E38] hover:text-[#731c2a]"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-96 relative">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-semibold mb-4 text-[#8D2E38]">Crear Nuevo Ingrediente</h2>

              <label className="block mb-2 font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={nuevoIngrediente.name}
                onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, name: e.target.value })}
                className="w-full mb-4 px-3 py-2 border rounded"
                placeholder="Ej. Harina"
              />

              <label className="block mb-2 font-medium text-gray-700">Stock</label>
              <input
                type="number"
                min="0"
                value={nuevoIngrediente.stock}
                onChange={(e) =>
                  setNuevoIngrediente({ ...nuevoIngrediente, stock: Number(e.target.value) })
                }
                className="w-full mb-6 px-3 py-2 border rounded"
                placeholder="Ej. 20"
              />

              <button
                onClick={crearIngrediente}
                disabled={loadingInv}
                className="w-full bg-[#3BAEA0] text-white py-2 rounded font-semibold hover:bg-[#329b91] transition"
              >
                {loadingInv ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
