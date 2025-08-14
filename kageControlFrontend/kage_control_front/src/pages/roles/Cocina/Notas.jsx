import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Clock, ChefHat, CheckCircle, Package, 
  Utensils, AlertCircle, RefreshCw, Eye, Users, MapPin,
  FileText, Info, AlertTriangle, Heart
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

// Tipos de restricciones dietéticas comunes
const DIETARY_TYPES = [
  { key: 'alergia', label: 'Alergias', color: colors.error, icon: AlertTriangle },
  { key: 'vegetariano', label: 'Vegetariano', color: colors.success, icon: Heart },
  { key: 'vegano', label: 'Vegano', color: colors.success, icon: Heart },
  { key: 'sin_gluten', label: 'Sin Gluten', color: colors.warning, icon: AlertCircle },
  { key: 'lactosa', label: 'Sin Lactosa', color: colors.warning, icon: AlertCircle },
  { key: 'diabetico', label: 'Diabético', color: colors.accent, icon: Heart },
  { key: 'otros', label: 'Otras Restricciones', color: colors.gray, icon: Info },
];

export default function Notas() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Función para cargar todas las órdenes con notas
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/orders/dietary-notes");
      setOrders(res.data);
      setLastUpdate(new Date());
      
      butterup.toast({
        title: "Datos actualizados",
        message: "Notas dietéticas actualizadas correctamente",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "success"
      });
    } catch (error) {
      console.error("Error al cargar notas:", error);
      butterup.toast({
        title: "Error al cargar",
        message: "No se pudieron cargar las notas dietéticas",
        location: "top-right",
        icon: false,
        dismissable: true,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Función para clasificar el tipo de restricción
  const classifyDietaryNote = (note) => {
    const noteText = note.toLowerCase();
    
    if (noteText.includes('alergia') || noteText.includes('alérgico') || noteText.includes('alergico')) {
      return 'alergia';
    }
    if (noteText.includes('vegetariano')) {
      return 'vegetariano';
    }
    if (noteText.includes('vegano')) {
      return 'vegano';
    }
    if (noteText.includes('gluten') || noteText.includes('celíaco') || noteText.includes('celiaco')) {
      return 'sin_gluten';
    }
    if (noteText.includes('lactosa') || noteText.includes('lácteo') || noteText.includes('lacteo')) {
      return 'lactosa';
    }
    if (noteText.includes('diabético') || noteText.includes('diabetico') || noteText.includes('azúcar') || noteText.includes('azucar')) {
      return 'diabetico';
    }
    return 'otros';
  };

  // Procesar y agrupar notas dietéticas por mesa
  const processedNotes = orders.reduce((acc, order) => {
    // Cada order ya viene con notas del backend
    const note = order.notes;
    const tableKey = order.table || order.arrival_id;
    const noteType = classifyDietaryNote(note);
    
    if (!acc[tableKey]) {
      acc[tableKey] = {
        table: tableKey,
        customer_name: order.customer_name || `Mesa ${tableKey}`,
        notes: new Set(),
        noteTypes: new Set(),
        orders: []
      };
    }
    
    acc[tableKey].notes.add(note);
    acc[tableKey].noteTypes.add(noteType);
    acc[tableKey].orders.push({
      id: order.id,
      status: order.status,
      items: order.items || []
    });
    
    return acc;
  }, {});

  // Convertir a array y aplicar filtros
  const notesArray = Object.values(processedNotes).map(entry => ({
    ...entry,
    notes: Array.from(entry.notes),
    noteTypes: Array.from(entry.noteTypes)
  }));

  // Filtrar notas
  const filteredNotes = notesArray.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      entry.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.table.toString().includes(searchTerm) ||
      entry.notes.some(note => note.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || entry.noteTypes.includes(typeFilter);
    
    return matchesSearch && matchesType;
  });

  // Estadísticas
  const stats = {
    total: notesArray.length,
    alergia: notesArray.filter(e => e.noteTypes.includes('alergia')).length,
    vegetariano: notesArray.filter(e => e.noteTypes.includes('vegetariano')).length,
    vegano: notesArray.filter(e => e.noteTypes.includes('vegano')).length,
    sin_gluten: notesArray.filter(e => e.noteTypes.includes('sin_gluten')).length,
    lactosa: notesArray.filter(e => e.noteTypes.includes('lactosa')).length,
    diabetico: notesArray.filter(e => e.noteTypes.includes('diabetico')).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🥗 Notas Dietéticas
              </h1>
              <p className="text-gray-600">
                Restricciones alimentarias y notas especiales para todos los comensales
              </p>
            </div>
            <button
              onClick={fetchAllOrders}
              disabled={loading}
              className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Estadísticas de restricciones */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Mesas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          {DIETARY_TYPES.slice(0, 6).map((type) => (
            <div key={type.key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{type.label}</p>
                  <p className="text-2xl font-bold" style={{ color: type.color }}>
                    {stats[type.key] || 0}
                  </p>
                </div>
                <type.icon className="w-8 h-8" style={{ color: type.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Controles de búsqueda y filtro */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar notas dietéticas
              </label>
              <input
                type="text"
                placeholder="Buscar por mesa, cliente o tipo de restricción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="w-full md:w-64">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors"
              >
                <option value="all">Todas las restricciones</option>
                {DIETARY_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredNotes.length} de {notesArray.length} mesas con restricciones
          </div>
        </div>

        </div>

        {/* Lista de notas dietéticas */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-xl font-semibold text-gray-600 mb-2">Cargando notas dietéticas...</p>
            <p className="text-gray-500">Obteniendo restricciones alimentarias</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-600 mb-2">
              {notesArray.length === 0 ? "No hay notas dietéticas" : "No se encontraron coincidencias"}
            </p>
            <p className="text-gray-500">
              {notesArray.length === 0 
                ? "Actualmente no hay restricciones alimentarias registradas" 
                : "Intenta con otros términos de búsqueda"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNotes.map((entry) => (
                <motion.div
                  key={entry.table}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Información de la mesa */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mesa {entry.table}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                          {entry.customer_name}
                        </span>
                      </div>
                      
                      {/* Tipos de restricciones */}
                      <div className="flex flex-wrap gap-2">
                        {entry.noteTypes.map((typeKey) => {
                          const typeInfo = DIETARY_TYPES.find(t => t.key === typeKey);
                          if (!typeInfo) return null;
                          
                          return (
                            <span
                              key={typeKey}
                              className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border"
                              style={{
                                backgroundColor: `${typeInfo.color}20`,
                                color: typeInfo.color,
                                borderColor: typeInfo.color
                              }}
                            >
                              <typeInfo.icon className="w-4 h-4" />
                              {typeInfo.label}
                            </span>
                          );
                        })}
                      </div>

                      {/* Notas específicas */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          Restricciones Específicas:
                        </h4>
                        <div className="space-y-2">
                          {entry.notes.map((note, idx) => (
                            <div
                              key={idx}
                              className="bg-red-50 border border-red-200 rounded-lg p-3"
                            >
                              <p className="text-red-800 font-medium">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Órdenes relacionadas */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Utensils className="w-4 h-4" />
                          Órdenes Activas ({entry.orders.length}):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {entry.orders.map((order) => (
                            <span
                              key={order.id}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              #{order.id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Indicador de urgencia */}
                    <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg p-4 min-w-[120px]">
                      <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-red-700 font-semibold text-sm text-center">
                        Atención Especial Requerida
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
  );
}
