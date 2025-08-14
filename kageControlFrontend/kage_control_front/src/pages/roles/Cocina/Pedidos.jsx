import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Clock, ChefHat, CheckCircle, Package, 
  Utensils, AlertCircle, RefreshCw, Eye, Users, MapPin, X,
  FileText, ShoppingCart
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

// Estados de pedidos con iconos y colores
const STATUS_OPTIONS = [
  { 
    value: "pending", 
    label: "Pendiente", 
    color: colors.warning,
    bgColor: "#FEF3C7",
    textColor: "#92400E",
    icon: Clock,
    description: "Orden recibida, esperando preparación"
  },
  { 
    value: "sent", 
    label: "Enviado a Cocina", 
    color: "#8B5CF6",
    bgColor: "#EDE9FE",
    textColor: "#5B21B6",
    icon: Utensils,
    description: "Orden enviada desde mesero"
  },
  { 
    value: "in_preparation", 
    label: "En Preparación", 
    color: colors.accent,
    bgColor: "#FDE68A",
    textColor: "#92400E",
    icon: ChefHat,
    description: "Cocina trabajando en la orden"
  },
  { 
    value: "ready", 
    label: "Listo para Servir", 
    color: colors.success,
    bgColor: "#D1FAE5",
    textColor: "#065F46",
    icon: CheckCircle,
    description: "Orden terminada, lista para llevar"
  },
  { 
    value: "served", 
    label: "Servido", 
    color: colors.primary,
    bgColor: "#E0F2FE",
    textColor: "#0C4A6E",
    icon: Package,
    description: "Orden servida al cliente"
  },
];

export default function Pedidos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Función para obtener información del estado
  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/orders/tracking");
      setOrders(res.data);
      setLastUpdate(new Date());
      
      butterup.toast({
        title: "Datos actualizados",
        message: "Lista de pedidos actualizada correctamente",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "success"
      });
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      butterup.toast({
        title: "Error al cargar",
        message: "No se pudieron cargar los pedidos",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalles = async (orderId) => {
    setDetailsLoading(true);
    setSelectedOrderId(orderId);
    try {
      const res = await axios.get(`http://localhost:8000/orders/${orderId}`);
      setOrderDetails(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error al cargar detalles:", error);
      butterup.toast({
        title: "Error al cargar",
        message: "No se pudieron cargar los detalles del pedido",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "error"
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch = searchTerm === "" || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table?.toString().includes(searchTerm) ||
      order.id.toString().includes(searchTerm) ||
      order.items?.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Estadísticas rápidas
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    sent: orders.filter(o => o.status === 'sent').length,
    inPreparation: orders.filter(o => o.status === 'in_preparation').length,
    ready: orders.filter(o => o.status === 'ready').length,
    served: orders.filter(o => o.status === 'served').length,
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🍽️ Pedidos de Cocina
              </h1>
              <p className="text-gray-600">
                Visualiza y gestiona todos los pedidos de las estaciones
              </p>
            </div>
            <button
              onClick={cargarPedidos}
              disabled={loading}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold" style={{ color: colors.warning }}>{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8" style={{ color: colors.warning }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviados</p>
                <p className="text-2xl font-bold" style={{ color: "#8B5CF6" }}>{stats.sent}</p>
              </div>
              <Utensils className="w-8 h-8" style={{ color: "#8B5CF6" }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En Preparación</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>{stats.inPreparation}</p>
              </div>
              <ChefHat className="w-8 h-8" style={{ color: colors.accent }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Listos</p>
                <p className="text-2xl font-bold" style={{ color: colors.success }}>{stats.ready}</p>
              </div>
              <CheckCircle className="w-8 h-8" style={{ color: colors.success }} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Servidos</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>{stats.served}</p>
              </div>
              <Package className="w-8 h-8" style={{ color: colors.primary }} />
            </div>
          </div>
        </div>

        {/* Controles de búsqueda y filtro */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar pedidos
              </label>
              <input
                type="text"
                placeholder="Buscar por mesa, cliente, ID o platillo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              />
            </div>

            {/* Filtro por estado */}
            <div className="w-full md:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por estado
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              >
                <option value="all">Todos los estados</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </div>
        </div>

        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-xl font-semibold text-gray-600 mb-2">Cargando pedidos...</p>
            <p className="text-gray-500">Obteniendo la información más reciente</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos disponibles</p>
            <p className="text-gray-500">Los pedidos aparecerán aquí cuando lleguen órdenes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Información del pedido */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusInfo.color }}></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mesa {order.table} — Pedido #{order.id}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          {order.time}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <statusInfo.icon className="w-5 h-5" style={{ color: statusInfo.color }} />
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold border"
                          style={{
                            backgroundColor: statusInfo.bgColor,
                            color: statusInfo.textColor,
                            borderColor: statusInfo.color
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>

                      {order.customer_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          Cliente: {order.customer_name}
                        </div>
                      )}
                    </div>

                    {/* Botón de acción */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <button
                        onClick={() => cargarDetalles(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors min-w-[140px] justify-center"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Modal de detalles mejorado */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        Detalles del Pedido #{selectedOrderId}
                      </h2>
                      {selectedOrder && (
                        <p className="text-blue-100">
                          Mesa {selectedOrder.table} • {selectedOrder.time}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {detailsLoading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Cargando detalles del pedido...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Estado del pedido */}
                      {selectedOrder && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Estado Actual
                          </h3>
                          <div className="flex items-center gap-3">
                            {(() => {
                              const statusInfo = getStatusInfo(selectedOrder.status);
                              return (
                                <>
                                  <statusInfo.icon className="w-6 h-6" style={{ color: statusInfo.color }} />
                                  <span
                                    className="px-4 py-2 rounded-full text-sm font-semibold border"
                                    style={{
                                      backgroundColor: statusInfo.bgColor,
                                      color: statusInfo.textColor,
                                      borderColor: statusInfo.color
                                    }}
                                  >
                                    {statusInfo.label}
                                  </span>
                                  <span className="text-gray-600 text-sm">
                                    {statusInfo.description}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Items del pedido */}
                      {selectedOrder && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Items del Pedido
                          </h3>
                          <div className="grid gap-3">
                            {selectedOrder.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3"
                              >
                                <Utensils className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-blue-900">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notas del pedido */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Notas del Pedido
                        </h3>
                        {orderDetails.length === 0 || !orderDetails.some(detail => detail.notes) ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 italic">No hay notas para este pedido</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {orderDetails.map((detail, idx) => (
                              detail.notes && (
                                <div
                                  key={idx}
                                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                                >
                                  <p className="text-yellow-800">{detail.notes}</p>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del modal */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
