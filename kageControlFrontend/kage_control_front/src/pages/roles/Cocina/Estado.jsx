import { useState, useEffect } from "react";
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

// Estados específicos para cocina con iconos y colores mejorados
const STATUS_OPTIONS = [
  { 
    value: "pending", 
    label: "Pendiente", 
    color: colors.warning,
    bgColor: "#FEF3C7",
    textColor: "#92400E",
    icon: Clock,
    description: "Orden recibida, esperando ser tomada"
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

const STATUS = [
  { label: "Pendiente", value: "pending", color: "bg-[#F75E5E] text-white" },
  { label: "En preparación", value: "in_preparation", color: "bg-[#3BBAC9] text-white" },
  { label: "Listo para servir", value: "ready", color: "bg-[#3BAEA0] text-white" },
  { label: "Enviado", value: "sent", color: "bg-[#F4A261] text-white" },
  { label: "Servido", value: "served", color: "bg-gray-200 text-gray-700 line-through" },
];

export default function Estado() {
  const [dishes, setDishes] = useState([]);
  const [tables, setTables] = useState({});
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Función para obtener información del estado
  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  // Obtener nombres de mesas
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("http://localhost:8000/tables/");
        const map = {};
        res.data.forEach((t) => {
          map[t.id] = t.name || `Mesa ${t.id}`;
        });
        setTables(map);
      } catch (e) {
        setError("Error al cargar mesas");
        console.error(e);
        butterup.toast({
          title: "Error al cargar",
          message: "No se pudieron cargar las mesas",
          location: "top-right",
          icon: false,
          dismissable: true,
          type: "error"
        });
      }
    };
    fetchTables();
  }, []);

  // Obtener menú
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("http://localhost:8000/menu/available");
        const map = {};
        res.data.forEach((item) => {
          map[item.id] = {
            name: item.name,
            price: item.price,
            description: item.description,
          };
        });
        setMenu(map);
      } catch (e) {
        setError("Error al cargar menú");
        console.error(e);
        butterup.toast({
          title: "Error al cargar",
          message: "No se pudo cargar el menú",
          location: "top-right",
          icon: false,
          dismissable: true,
          type: "error"
        });
      }
    };
    fetchMenu();
  }, []);

  // Función para cargar órdenes con notificaciones
  const loadOrders = async () => {
    if (Object.keys(tables).length === 0 || Object.keys(menu).length === 0) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/orders/");
      const allDishes = [];
      res.data.forEach((order) => {
        order.dishes.forEach((dish, i) => {
          const platillo = menu[dish.dish_id] || {};
          allDishes.push({
            uniqueId: `${order.id}-${dish.dish_id}-${i}`,
            orderId: order.id,
            arrivalId: order.arrival_id,
            table: tables[order.arrival_id] || `Mesa ${order.arrival_id}`,
            dishId: dish.dish_id,
            dishName: platillo.name || `Platillo ${dish.dish_id}`,
            price: platillo.price || 0,
            description: platillo.description || "",
            quantity: dish.quantity,
            notes: order.notes,
            status: order.status,
          });
        });
      });
      setDishes(allDishes);
      setLastUpdate(new Date());
      
      butterup.toast({
        title: "Datos actualizados",
        message: "Lista de platillos actualizada correctamente",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "success"
      });
    } catch (e) {
      setError("Error al cargar órdenes");
      console.error(e);
      butterup.toast({
        title: "Error al cargar",
        message: "No se pudieron cargar las órdenes",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtener órdenes
  useEffect(() => {
    loadOrders();
  }, [tables, menu]);

  // Manejo de cambio de estado directo
  const handleStatusChange = async (uniqueId, orderId, newStatus) => {
    try {
      // Actualizar estado local inmediatamente
      setDishes((prev) =>
        prev.map((dish) =>
          dish.uniqueId === uniqueId ? { ...dish, status: newStatus } : dish
        )
      );
      
      // Actualizar en backend
      await axios.patch(`http://localhost:8000/orders/${orderId}/status?status=${newStatus}`);
      
      const statusInfo = getStatusInfo(newStatus);
      butterup.toast({
        title: "Estado actualizado",
        message: `Platillo marcado como: ${statusInfo.label}`,
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "success"
      });

      // Recargar datos después del cambio exitoso
      setTimeout(() => {
        loadOrders();
      }, 1000);

    } catch (e) {
      setError("Error al actualizar estado");
      console.error(e);
      
      let errorMessage = "No se pudo cambiar el estado del platillo";
      if (e.response?.status === 422) {
        errorMessage = "El estado seleccionado no es válido para esta orden";
      }
      
      butterup.toast({
        title: "Error al actualizar",
        message: errorMessage,
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "error"
      });
      
      // Revertir cambio local en caso de error
      loadOrders();
    }
  };

  // Filtrar platillos
  const filteredDishes = dishes.filter(dish => {
    const matchesFilter = filter === "all" || dish.status === filter;
    const matchesSearch = searchTerm === "" || 
      dish.table?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.dishName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.orderId.toString().includes(searchTerm) ||
      dish.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Estadísticas rápidas
  const stats = {
    total: dishes.length,
    pending: dishes.filter(d => d.status === 'pending').length,
    sent: dishes.filter(d => d.status === 'sent').length,
    inPreparation: dishes.filter(d => d.status === 'in_preparation').length,
    ready: dishes.filter(d => d.status === 'ready').length,
    served: dishes.filter(d => d.status === 'served').length,
  };

  if (loading)
    return <div className="p-8 text-center text-[#4D4D4D] font-semibold font-sans">Cargando datos...</div>;

  if (error)
    return <div className="p-8 text-center text-red-600 font-semibold font-sans">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🍳 Estado de Cocina
              </h1>
              <p className="text-gray-600">
                Actualiza el estado de preparación de los platillos
              </p>
            </div>
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
                Buscar platillos
              </label>
              <input
                type="text"
                placeholder="Buscar por mesa, platillo, orden o notas..."
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
            Mostrando {filteredDishes.length} de {dishes.length} platillos
          </div>
        </div>

        {/* Lista de platillos */}
        {filteredDishes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600 mb-2">No hay platillos disponibles</p>
            <p className="text-gray-500">Los platillos aparecerán aquí cuando lleguen órdenes</p>
          </div>
        ) : (
          <div className="space-y-4">{filteredDishes.map((dish) => {
            const statusInfo = getStatusInfo(dish.status);
            const status = STATUS.find((s) => s.value === dish.status) || STATUS[0];
            
            // Restricciones específicas para COCINA
            const allowedTransitions = {
              pending: ["pending", "in_preparation"], // Cocina puede tomar pedidos pendientes
              sent: ["sent", "in_preparation"], // Cocina puede tomar pedidos enviados
              in_preparation: ["in_preparation", "ready"], // Cocina puede terminar preparación
              ready: ["ready"], // No puede cambiar, solo mesero puede servir
              served: ["served"], // Ya servido, no puede cambiar
            };
            
            return (
              <motion.div
                key={dish.uniqueId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Información del platillo */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: statusInfo.color }}></div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {dish.table} — {dish.dishName}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        Orden #{dish.orderId}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Cantidad: {dish.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 text-green-600">$</span>
                        ${dish.price}
                      </span>
                    </div>

                    {dish.description && (
                      <p className="text-gray-600 text-sm">{dish.description}</p>
                    )}

                    {dish.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm font-medium">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Notas: {dish.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Estado y controles */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Estado actual */}
                    <div className="flex items-center gap-2">
                      <statusInfo.icon className="w-5 h-5" style={{ color: statusInfo.color }} />
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
                    </div>

                    {/* Selector de estado */}
                    <select
                      value={dish.status}
                      onChange={(e) =>
                        handleStatusChange(dish.uniqueId, dish.orderId, e.target.value)
                      }
                      disabled={dish.status === "ready" || dish.status === "served"}
                      className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all min-w-[180px]
                      ${
                        dish.status === "ready" || dish.status === "served"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300"
                          : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    >
                      {STATUS_OPTIONS.filter((s) =>
                        allowedTransitions[dish.status]?.includes(s.value)
                      ).map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  </div>
  );
}
