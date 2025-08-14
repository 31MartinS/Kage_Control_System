import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Clock, ChefHat, CheckCircle, Package, 
  Utensils, AlertCircle, RefreshCw, Eye, Users, MapPin
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

// Estados de pedidos con traducciones, colores e iconos
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
    description: "Orden enviada a cocina"
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
  { 
    value: "sent", 
    label: "Enviado", 
    color: "#8B5CF6",
    bgColor: "#F3E8FF",
    textColor: "#581C87",
    icon: Utensils,
    description: "Orden enviada a cocina"
  }
];

const getStatusInfo = (status) => {
  return STATUS_OPTIONS.find(s => s.value === status) || {
    label: "Desconocido",
    color: colors.gray,
    bgColor: "#F3F4F6",
    textColor: "#374151",
    icon: AlertCircle,
    description: "Estado no reconocido"
  };
};

export default function SeguimientoPedidos() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/orders/tracking");
      setOrders(response.data);
      setLastUpdate(new Date());
      
      butterup.toast({
        title: "Datos actualizados",
        message: "Lista de pedidos actualizada correctamente",
        type: "success",
        location: "top-right",
        icon: false,
        dismissable: true
      });
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      butterup.toast({
        title: "Error al cargar",
        message: "No se pudieron cargar los pedidos",
        type: "error",
        location: "top-right",
        icon: false,
        dismissable: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Remover auto-refresh automático - solo manual
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(`Cambiando orden ${id} a estado: ${newStatus}`); // Debug
      
      const response = await axios.patch(`http://localhost:8000/orders/${id}/status?status=${newStatus}`);
      
      console.log("Respuesta del servidor:", response.data); // Debug
      
      setOrders(orders =>
        orders.map(order =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );

      const statusInfo = getStatusInfo(newStatus);
      butterup.toast({
        title: "Estado actualizado",
        message: `Orden #${id} marcada como: ${statusInfo.label}`,
        type: "success",
        location: "top-right",
        icon: false,
        dismissable: true
      });

      // Recargar datos después del cambio exitoso
      setTimeout(() => {
        loadOrders();
      }, 1000);

    } catch (error) {
      console.error("Error completo:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      
      let errorMessage = "No se pudo cambiar el estado de la orden";
      
      if (error.response?.status === 422) {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (detail?.message) {
          errorMessage = detail.message;
        } else {
          errorMessage = "El estado seleccionado no es válido para esta orden";
        }
      }
      
      butterup.toast({
        title: "Error al actualizar",
        message: errorMessage,
        type: "error",
        location: "top-right",
        icon: false,
        dismissable: true
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Eye className="w-10 h-10" style={{ color: colors.primary }} />
            Seguimiento de Pedidos
          </h1>
          <p className="text-lg text-gray-600">Monitorea y actualiza el estado de todas las órdenes</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}</span>
            <button
              onClick={loadOrders}
              disabled={loading}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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

        {/* Controles de filtrado y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
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

        {/* Lista de pedidos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
              <span className="ml-3 text-gray-600">Cargando pedidos...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay pedidos</h3>
              <p className="text-gray-500">
                {searchTerm || filter !== "all" 
                  ? "No se encontraron pedidos con los filtros aplicados" 
                  : "Aún no hay pedidos en el sistema"}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Información del pedido */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                Orden #{order.id}
                              </h3>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>Mesa {order.table}</span>
                              </div>
                              {order.customer_name && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  <span>{order.customer_name}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {order.time || new Date().toLocaleTimeString('es-ES')}
                            </div>
                            <div className="text-sm text-gray-700">
                              <strong>Platillos:</strong> {order.items?.join(", ") || "Sin detalles"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estado y controles */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Estado actual */}
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-5 h-5" style={{ color: statusInfo.color }} />
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ 
                              backgroundColor: statusInfo.bgColor,
                              color: statusInfo.textColor
                            }}
                          >
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Control de cambio de estado */}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={order.status === "delivered" || order.status === "pending"}
                          className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                            order.status === "delivered" || order.status === "pending"
                              ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                              : "bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          }`}
                        >
                          {(() => {
                            // Definir transiciones permitidas según el estado actual
                            // Ajustado para coincidir con los estados del backend
                            const allowedTransitions = {
                              pending: ["pending", "sent"],
                              sent: ["sent", "in_preparation"], 
                              in_preparation: ["in_preparation", "ready"],
                              ready: ["ready", "served"],
                              served: ["served"]
                            };

                            const allowedStates = allowedTransitions[order.status] || [order.status];
                            
                            return STATUS_OPTIONS
                              .filter(status => allowedStates.includes(status.value))
                              .map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ));
                          })()}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
