import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Plus, Minus, Trash2, CheckCircle, Clock, 
  ChefHat, Utensils, User, AlertCircle, Package, Send
} from "lucide-react";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

const colors = {
  primary: '#3BAEA0',
  secondary: '#E76F51', 
  accent: '#F4A261',
  dark: '#264653',
  light: '#F8FAFC',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: '#6B7280'
};

// Mapeo de estados del backend al español
const statusTranslations = {
  'pending': { text: 'Pendiente', color: '#F59E0B', icon: Clock },
  'in_progress': { text: 'En Preparación', color: '#F4A261', icon: ChefHat },
  'ready': { text: 'Listo', color: '#10B981', icon: CheckCircle },
  'delivered': { text: 'Entregado', color: '#3BAEA0', icon: Package },
  'cancelled': { text: 'Cancelado', color: '#EF4444', icon: AlertCircle },
  'sent': { text: 'Enviado', color: '#8B5CF6', icon: Send },
  // Fallback para otros posibles estados
  default: { text: 'Desconocido', color: '#6B7280', icon: AlertCircle }
};

const translateStatus = (status) => {
  return statusTranslations[status] || statusTranslations.default;
};

export default function Ordenes() {
  const [arrivalId, setArrivalId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [menu, setMenu] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [ordenes, setOrdenes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const addItem = (item) => {
    setCarrito((c) => ({
      ...c,
      [item.id]: {
        ...item,
        cantidad: (c[item.id]?.cantidad || 0) + 1,
      },
    }));
  };

  const removeItem = (id) => {
    setCarrito((c) => {
      const updated = { ...c };
      if (updated[id].cantidad > 1) {
        updated[id].cantidad--;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const total = Object.values(carrito).reduce(
    (sum, it) => sum + it.precio * it.cantidad,
    0
  );

  // MODAL de confirmación
  const confirmarOrden = () => {
    if (!arrivalId) {
      butterup.toast({
        title: "Error",
        message: "Por favor selecciona un arrival antes de confirmar la orden.",
        type: "error",
        dismissable: true,
      });
      return;
    }
    if (Object.values(carrito).length === 0) {
      butterup.toast({
        title: "Carrito vacío",
        message: "Agrega al menos un platillo antes de confirmar.",
        type: "error",
        dismissable: true,
      });
      return;
    }
    setShowModal(true);
  };

  const enviarOrden = async () => {
    setShowModal(false);
    const dishes = Object.values(carrito).map((item) => ({
      dish_id: item.id,
      quantity: item.cantidad,
    }));

    const data = {
      arrival_id: parseInt(arrivalId),
      station: "cocina",
      notes: "",
      dishes,
    };

    try {
      await axios.post("http://localhost:8000/orders/", data);
      setCarrito({});
      butterup.toast({
        title: "Orden Confirmada",
        message: "La orden fue enviada correctamente ✅",
        type: "success",
        dismissable: true,
      });
      cargarOrdenes();
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: error.response?.data?.detail || "Error al enviar la orden ❌",
        type: "error",
        dismissable: true,
      });
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8000/arrivals/");
      setUsuarios(res.data);
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: "No se pudieron obtener los usuarios",
        type: "error",
        dismissable: true,
      });
    }
  };

  const cargarMenu = async () => {
    try {
      const res = await axios.get("http://localhost:8000/menu/available/");
      setMenu(res.data);
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: "No se pudo cargar el menú",
        type: "error",
        dismissable: true,
      });
    }
  };

  const cargarOrdenes = async () => {
    if (!arrivalId) return;
    try {
      const res = await axios.get(`http://localhost:8000/orders/${arrivalId}`);
      setOrdenes(res.data);
    } catch (error) {
      // Silencia el error si no hay órdenes
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (arrivalId) {
      cargarMenu();
      cargarOrdenes();
    }
  }, [arrivalId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Utensils className="w-10 h-10" style={{ color: colors.primary }} />
            Gestión de Órdenes
          </h1>
          <p className="text-lg text-gray-600">Selecciona cliente y gestiona las órdenes de platillos</p>
        </div>

        {/* Selección de cliente */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 max-w-md mx-auto">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Seleccionar Cliente
          </label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
            value={arrivalId || ""}
            onChange={(e) => setArrivalId(e.target.value)}
          >
            <option value="">-- Selecciona una llegada --</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.customer_name || `Mesa ${u.table_id}`} - Mesa {u.table_id}
              </option>
            ))}
          </select>
        </div>

        {arrivalId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menú disponible */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ChefHat className="w-6 h-6" style={{ color: colors.primary }} />
                  Menú Disponible
                </h2>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {menu.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                        <span className="text-lg font-bold" style={{ color: colors.primary }}>
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          addItem({
                            id: item.id,
                            nombre: item.name,
                            precio: item.price,
                          })
                        }
                        className="w-full py-2 px-4 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar: Carrito + Órdenes */}
            <div className="space-y-6">
              {/* Carrito */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" style={{ color: colors.secondary }} />
                  Carrito
                </h3>
                
                {Object.values(carrito).length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Carrito vacío</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {Object.values(carrito).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.nombre}</p>
                            <p className="text-sm text-gray-600">
                              ${item.precio.toFixed(2)} × {item.cantidad}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => addItem(item)}
                                className="p-1 hover:bg-gray-200 rounded"
                                style={{ color: colors.primary }}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-xl font-bold" style={{ color: colors.secondary }}>
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={confirmarOrden}
                        className="w-full py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Confirmar Orden
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Órdenes enviadas */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" style={{ color: colors.accent }} />
                  Órdenes Enviadas
                </h3>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {ordenes.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No hay órdenes enviadas</p>
                    </div>
                  ) : (
                    ordenes.map((order) => {
                      const statusInfo = translateStatus(order.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-900">
                              Orden #{order.id}
                            </span>
                            <div className="flex items-center gap-1">
                              <StatusIcon className="w-4 h-4" style={{ color: statusInfo.color }} />
                              <span 
                                className="text-xs font-medium px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: statusInfo.color }}
                              >
                                {statusInfo.text}
                              </span>
                            </div>
                          </div>
                          {order.created_at && (
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleString('es-ES')}
                            </p>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación mejorado */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4" 
                       style={{ backgroundColor: `${colors.primary}20` }}>
                    <CheckCircle className="h-8 w-8" style={{ color: colors.primary }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Confirmar Orden
                  </h3>
                  <p className="text-gray-600">
                    Revisa los detalles antes de enviar
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                  {Object.values(carrito).map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-900">{item.nombre}</span>
                        <span className="text-gray-600 ml-2">× {item.cantidad}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-xl font-bold" style={{ color: colors.secondary }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={enviarOrden}
                    className="flex-1 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Enviar Orden
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
