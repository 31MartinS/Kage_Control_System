import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import { 
  FileDown, SlidersHorizontal, Calendar, Check, X, Eye, Download, 
  Clock, Users, UtensilsCrossed, BarChart3, AlertCircle, CheckCircle,
  Settings, Filter, RefreshCw, FileText, ChevronRight, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SECCIONES_DISPONIBLES = [
  { 
    id: "reservas", 
    label: "Reservas y Mesas", 
    description: "Análisis de reservas, ocupación y estado de mesas",
    icon: Calendar,
    color: "#3BAEA0"
  },
  { 
    id: "ordenes", 
    label: "Órdenes y Menú", 
    description: "Platos más populares, consumo y análisis del menú",
    icon: UtensilsCrossed,
    color: "#E76F51"
  },
  { 
    id: "comensales", 
    label: "Comensales y Grupos", 
    description: "Tamaño de grupos, distribución y análisis de clientes",
    icon: Users,
    color: "#F4A261"
  }
];

export default function Informes() {
  const [desde, setDesde] = useState(() => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 30);
    return fecha.toISOString().slice(0, 16);
  });
  
  const [hasta, setHasta] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });
  
  const [seleccionadas, setSeleccionadas] = useState(["reservas", "ordenes", "comensales"]);
  const [descargando, setDescargando] = useState(false);
  const [previsualizando, setPrevisualizando] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [errores, setErrores] = useState({
    desde: "",
    hasta: "",
    secciones: "",
  });

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosClient.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setErrores(prev => ({ ...prev, secciones: "" }));
  };

  const seleccionarTodo = () => {
    if (seleccionadas.length === SECCIONES_DISPONIBLES.length) {
      setSeleccionadas([]);
    } else {
      setSeleccionadas(SECCIONES_DISPONIBLES.map((s) => s.id));
    }
    setErrores(prev => ({ ...prev, secciones: "" }));
  };

  const validarFormulario = () => {
    const ahora = new Date();
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    
    const nuevosErrores = {
      desde: "",
      hasta: "",
      secciones: "",
    };

    if (!desde) nuevosErrores.desde = "Fecha inicial requerida";
    if (!hasta) nuevosErrores.hasta = "Fecha final requerida";

    if (desde && hasta && fechaDesde > fechaHasta) {
      nuevosErrores.desde = "No debe ser mayor a la fecha final";
      nuevosErrores.hasta = "No debe ser menor a la fecha inicial";
    }

    if (hasta && fechaHasta > ahora) {
      nuevosErrores.hasta = "No puede ser una fecha futura";
    }

    // Validar que no sea más de 1 año de diferencia
    if (desde && hasta) {
      const diffTime = Math.abs(fechaHasta - fechaDesde);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        nuevosErrores.hasta = "El rango no puede ser mayor a 1 año";
      }
    }

    if (seleccionadas.length === 0) {
      nuevosErrores.secciones = "Selecciona al menos una sección";
    }

    setErrores(nuevosErrores);
    return Object.values(nuevosErrores).every((e) => !e);
  };

  const descargarPDF = async () => {
    if (!validarFormulario()) return;

    setDescargando(true);
    try {
      const sectionsParam = seleccionadas.join(',');
      
      const response = await axiosClient.get('/reports/pdf', {
        params: {
          start: desde,
          end: hasta,
          sections: sectionsParam
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_kagecontrol_${desde.split('T')[0]}_${hasta.split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Mostrar notificación de éxito
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '📥 Descarga completada exitosamente';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ Error al generar el informe';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } finally {
      setDescargando(false);
    }
  };

  const mostrarVistaPrevia = async () => {
    if (!validarFormulario()) return;

    setPrevisualizando(true);
    try {
      const sectionsParam = seleccionadas.join(',');
      
      const response = await axiosClient.get('/reports/pdf', {
        params: {
          start: desde,
          end: hasta,
          sections: sectionsParam
        },
        responseType: 'blob'
      });

      const fileURL = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error('Error al generar vista previa:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = '❌ No se pudo generar la vista previa';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } finally {
      setPrevisualizando(false);
    }
  };

  const calcularDiasSeleccionados = () => {
    if (!desde || !hasta) return 0;
    const fechaDesde = new Date(desde);
    const fechaHasta = new Date(hasta);
    const diffTime = Math.abs(fechaHasta - fechaDesde);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPreviewData = () => {
    if (!dashboardData) return null;
    
    const totalReservas = Object.values(dashboardData?.reservas?.por_dia || {}).reduce((a, b) => a + b, 0);
    const totalComensales = Object.values(dashboardData?.comensales?.por_dia || {}).reduce((a, b) => a + b, 0);
    const topPlatos = dashboardData?.ordenes?.top_platos?.length || 0;
    
    return { totalReservas, totalComensales, topPlatos };
  };

  const previewData = getPreviewData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
              <FileText className="w-10 h-10" style={{ color: colors.primary }} />
              Generador de Informes
            </h1>
            <p className="text-lg text-gray-600">Crea reportes personalizados en PDF con análisis detallado</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Panel de configuración */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6" style={{ color: colors.primary }} />
                Configuración del Reporte
              </h2>

              {/* Selección de fechas */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha inicial
                  </label>
                  <input
                    type="datetime-local"
                    value={desde}
                    onChange={(e) => {
                      setDesde(e.target.value);
                      setErrores(prev => ({ ...prev, desde: "" }));
                    }}
                    max={hasta || undefined}
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 transition-colors ${
                      errores.desde 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  {errores.desde && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errores.desde}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha final
                  </label>
                  <input
                    type="datetime-local"
                    value={hasta}
                    onChange={(e) => {
                      setHasta(e.target.value);
                      setErrores(prev => ({ ...prev, hasta: "" }));
                    }}
                    max={new Date().toISOString().slice(0, 16)}
                    min={desde || undefined}
                    className={`w-full px-4 py-3 border-2 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 transition-colors ${
                      errores.hasta 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-200 focus:ring-blue-500'
                    }`}
                  />
                  {errores.hasta && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errores.hasta}
                    </p>
                  )}
                </div>
              </div>

              {/* Info del período */}
              {desde && hasta && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Info className="w-5 h-5" />
                    <span className="font-medium">
                      Período seleccionado: {calcularDiasSeleccionados()} días
                    </span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    Desde {new Date(desde).toLocaleDateString('es-ES', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })} hasta {new Date(hasta).toLocaleDateString('es-ES', { 
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              )}

              {/* Selección de secciones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Secciones a incluir
                  </label>
                  <button
                    onClick={seleccionarTodo}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {seleccionadas.length === SECCIONES_DISPONIBLES.length
                      ? "Deseleccionar todo"
                      : "Seleccionar todo"}
                  </button>
                </div>

                <div className="space-y-3">
                  {SECCIONES_DISPONIBLES.map((seccion) => {
                    const Icon = seccion.icon;
                    const isSelected = seleccionadas.includes(seccion.id);
                    
                    return (
                      <motion.div
                        key={seccion.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => toggleSeleccion(seccion.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Icon 
                              className="w-5 h-5" 
                              style={{ color: isSelected ? colors.primary : colors.gray }} 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800">{seccion.label}</h3>
                              {isSelected && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </div>
                            <p className="text-sm text-gray-600">{seccion.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {errores.secciones && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errores.secciones}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Panel de vista previa y acciones */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" style={{ color: colors.secondary }} />
                Vista Previa del Reporte
              </h3>

              {previewData && (
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reservas</span>
                      <span className="font-bold" style={{ color: colors.primary }}>
                        {previewData.totalReservas}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Comensales</span>
                      <span className="font-bold" style={{ color: colors.accent }}>
                        {previewData.totalComensales}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Platos Únicos</span>
                      <span className="font-bold" style={{ color: colors.secondary }}>
                        {previewData.topPlatos}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={mostrarVistaPrevia}
                  disabled={previsualizando || seleccionadas.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    previsualizando || seleccionadas.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-800'
                  }`}
                >
                  {previsualizando ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  {previsualizando ? 'Generando...' : 'Vista Previa'}
                </button>

                <button
                  onClick={descargarPDF}
                  disabled={descargando || seleccionadas.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    descargando || seleccionadas.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={{ 
                    backgroundColor: descargando || seleccionadas.length === 0 ? undefined : colors.primary 
                  }}
                >
                  {descargando ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {descargando ? 'Generando PDF...' : 'Descargar PDF'}
                </button>
              </div>
            </motion.div>

            {/* Información adicional */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
            >
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Sobre los Reportes
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Los reportes incluyen gráficos y análisis detallados
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Formato PDF profesional con branding de KageControl
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Métricas calculadas automáticamente
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  Datos actualizados en tiempo real
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
