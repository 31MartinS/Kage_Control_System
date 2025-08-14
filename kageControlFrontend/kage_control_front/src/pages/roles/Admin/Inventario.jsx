import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  X,
  Pencil,
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
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({ name: "", stock: "" });
  const [ingredienteCoincidente, setIngredienteCoincidente] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);
  const [modalDetallesPlatillo, setModalDetallesPlatillo] = useState(false);
  const [platilloSeleccionado, setPlatilloSeleccionado] = useState(null);

  const cargarDatos = async () => {
    try {
      const [menu, ingredientes] = await Promise.all([
        axiosClient.get("/menu"),
        axiosClient.get("/ingredients"),
      ]);
      setPlatillos(menu.data);
      setIngredientes(ingredientes.data);
    } catch (error) {
      butterup.error("Error al cargar los datos del inventario.");
    }
  };

  const calcularDisponibilidad = (platillo) => {
    if (!platillo.ingredients || platillo.ingredients.length === 0) {
      return true; // Si no tiene ingredientes definidos, asumimos que está disponible
    }
    
    return platillo.ingredients.every(dishIngredient => {
      const ingrediente = ingredientes.find(ing => ing.id === dishIngredient.ingredient_id);
      if (!ingrediente) return false;
      return ingrediente.stock >= (dishIngredient.quantity_needed || 1);
    });
  };

  const mostrarDetallesPlatillo = (platillo) => {
    setPlatilloSeleccionado(platillo);
    setModalDetallesPlatillo(true);
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

  const abrirModalEditar = (ingrediente) => {
    setEditando(true);
    setIngredienteEditando(ingrediente);
    setNuevoIngrediente({
      name: ingrediente.name,
      stock: ingrediente.stock.toString()
    });
    setModalOpen(true);
  };

  const actualizarIngrediente = async () => {
    if (!nuevoIngrediente.name.trim() || !nuevoIngrediente.stock) {
      butterup.toast({
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
        dismissable: true
      });
      return;
    }

    setLoadingInv(true);
    try {
      await axiosClient.put(`/ingredients/${ingredienteEditando.id}`, {
        name: nuevoIngrediente.name.trim(),
        stock: parseInt(nuevoIngrediente.stock)
      });
      
      butterup.toast({
        title: "Ingrediente actualizado",
        message: "El ingrediente se actualizó correctamente",
        type: "success",
        dismissable: true
      });
      
      setModalOpen(false);
      setEditando(false);
      setIngredienteEditando(null);
      setNuevoIngrediente({ name: "", stock: "" });
      await cargarDatos();
    } catch (err) {
      console.error(err);
      butterup.toast({
        title: "Error",
        message: "Error al actualizar el ingrediente",
        type: "error",
        dismissable: true
      });
    } finally {
      setLoadingInv(false);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(false);
    setIngredienteEditando(null);
    setNuevoIngrediente({ name: "", stock: "" });
  };

  const abrirModalCrear = () => {
    setEditando(false);
    setIngredienteEditando(null);
    setNuevoIngrediente({ name: "", stock: "" });
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Gestión de Inventario
              </h1>
              <p className="text-gray-600 text-lg">
                Administra los ingredientes y productos de tu restaurante
              </p>
            </div>
            <button
              onClick={abrirModalCrear}
              className="mt-4 md:mt-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              Agregar Ingrediente
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ingredientes</p>
                  <p className="text-3xl font-bold text-gray-900">{ingredientes.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platillos Disponibles</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {platillos.filter(platillo => calcularDisponibilidad(platillo)).length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <ChefHat className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {ingredientes.filter(i => i.stock < 10).length}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INVENTARIO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Inventario de Ingredientes</h2>
                    <p className="text-gray-600 text-sm">Control de stock y productos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {ingredientes.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-600 mb-2">No hay ingredientes</p>
                  <p className="text-gray-500">Comienza agregando tu primer ingrediente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {ingredientes.map((ingrediente) => (
                      <motion.div
                        key={ingrediente.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{ingrediente.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  ingrediente.stock < 10 
                                    ? 'bg-red-100 text-red-700' 
                                    : ingrediente.stock < 20 
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  Stock: {ingrediente.stock}
                                </span>
                                {ingrediente.stock < 10 && (
                                  <span className="flex items-center gap-1 text-red-600 text-xs">
                                    <AlertTriangle className="w-3 h-3" />
                                    Bajo stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => abrirModalEditar(ingrediente)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(ingrediente.id)}
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

          {/* PLATILLOS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChefHat className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Platillos del Menú</h2>
                  <p className="text-gray-600 text-sm">Platos disponibles en el restaurante</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {platillos.length === 0 ? (
                <div className="text-center py-12">
                  <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-gray-600 mb-2">No hay platillos</p>
                  <p className="text-gray-500">Los platillos aparecerán aquí automáticamente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {platillos.map((platillo) => (
                      <motion.div
                        key={platillo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{platillo.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  ${platillo.price}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  calcularDisponibilidad(platillo)
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {calcularDisponibilidad(platillo) ? 'Disponible' : 'No disponible'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => mostrarDetallesPlatillo(platillo)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ClipboardList className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Modal para crear ingrediente */}
      <AnimatePresence>
        {modalOpen && (
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
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="w-6 h-6 text-blue-600" />
                      {editando ? "Editar Ingrediente" : "Nuevo Ingrediente"}
                    </h2>
                    <button
                      onClick={cerrarModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Ingrediente
                    </label>
                    <input
                      type="text"
                      value={nuevoIngrediente.name}
                      onChange={(e) =>
                        setNuevoIngrediente({ ...nuevoIngrediente, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej. Harina, Tomate, Aceite"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      value={nuevoIngrediente.stock}
                      onChange={(e) =>
                        setNuevoIngrediente({ ...nuevoIngrediente, stock: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ej. 20"
                      min="0"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editando ? actualizarIngrediente : () => crearIngrediente()}
                      disabled={loadingInv}
                      className={`flex-1 px-4 py-3 rounded-xl transition-all font-medium ${
                        loadingInv
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                      }`}
                    >
                      {loadingInv 
                        ? "Guardando..." 
                        : editando 
                        ? "Actualizar Ingrediente" 
                        : "Crear Ingrediente"
                      }
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para ingrediente similar */}
      <AnimatePresence>
        {ingredienteCoincidente && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Ingrediente Similar Encontrado
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Ya existe un producto llamado <span className="font-semibold">{ingredienteCoincidente.name}</span>. 
                  ¿Deseas actualizar su stock o crear uno nuevo?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setIngredienteCoincidente(null);
                      setModalOpen(false);
                      await crearIngrediente(true);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Crear Nuevo
                  </button>
                  <button
                    onClick={async () => {
                      setIngredienteCoincidente(null);
                      setModalOpen(false);
                      await crearIngrediente(true);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                  >
                    Actualizar Stock
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminar */}
      <AnimatePresence>
        {confirmDeleteId && (
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
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
                  Eliminar Ingrediente
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  ¿Estás seguro de que deseas eliminar este ingrediente? Esta acción no se puede deshacer.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={eliminarIngrediente}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalles del Platillo */}
      <AnimatePresence>
        {modalDetallesPlatillo && platilloSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detalles del Platillo</h2>
                <button
                  onClick={() => setModalDetallesPlatillo(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{platilloSeleccionado.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      ${platilloSeleccionado.price}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      calcularDisponibilidad(platilloSeleccionado)
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {calcularDisponibilidad(platilloSeleccionado) ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                  {platilloSeleccionado.description && (
                    <p className="text-gray-600 mt-3">{platilloSeleccionado.description}</p>
                  )}
                </div>

                {/* Ingredientes requeridos */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ingredientes Requeridos</h4>
                  {platilloSeleccionado.ingredients && platilloSeleccionado.ingredients.length > 0 ? (
                    <div className="space-y-3">
                      {platilloSeleccionado.ingredients.map((dishIngredient, index) => {
                        const ingrediente = ingredientes.find(ing => ing.id === dishIngredient.ingredient_id);
                        const cantidadNecesaria = dishIngredient.quantity_needed || 1;
                        const stockDisponible = ingrediente ? ingrediente.stock : 0;
                        const suficiente = stockDisponible >= cantidadNecesaria;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${suficiente ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="font-medium text-gray-900">
                                {ingrediente ? ingrediente.name : 'Ingrediente no encontrado'}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Necesario: <span className="font-medium">{cantidadNecesaria}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Disponible: <span className={`font-medium ${suficiente ? 'text-green-600' : 'text-red-600'}`}>
                                  {stockDisponible}
                                </span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No hay ingredientes definidos para este platillo</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setModalDetallesPlatillo(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
