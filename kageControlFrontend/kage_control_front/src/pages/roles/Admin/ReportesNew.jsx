import React, { useState, useEffect } from 'react';
import axiosClient from '../../../api/axiosClient';
import { 
  Calendar, TrendingUp, Users, UtensilsCrossed, BarChart3, Download, 
  ChevronDown, ChevronUp, FileText, Clock, Target, Award, Activity,
  Filter, RefreshCw, Eye, Settings, PieChart as PieIcon, DollarSign,
  ArrowUp, ArrowDown, Minus, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar 
} from 'recharts';

export default function Reportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    resumen: true,
    reservas: true,
    ordenes: true,
    comensales: true,
    analisis: true
  });

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [selectedSections, setSelectedSections] = useState({
    reservas: true,
    ordenes: true,
    comensales: true
  });

  const [viewMode, setViewMode] = useState('dashboard');

  // Paleta de colores mejorada
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

  const chartColors = [colors.primary, colors.secondary, colors.accent, colors.dark, colors.success];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/reports/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const generatePDF = async () => {
    try {
      const sectionsParam = Object.entries(selectedSections)
        .filter(([key, value]) => value)
        .map(([key]) => key)
        .join(',');
      
      const response = await axiosClient.get('/reports/pdf', {
        params: {
          start: dateRange.start + 'T00:00:00',
          end: dateRange.end + 'T23:59:59',
          sections: sectionsParam
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_kagecontrol_${dateRange.start}_${dateRange.end}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al generar PDF:', error);
    }
  };

  const prepareChartData = (dataObj, type) => {
    if (!dataObj) return [];
    
    switch (type) {
      case 'reservas_dia':
        return Object.entries(dataObj.por_dia || {}).map(([fecha, total]) => ({
          fecha: new Date(fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          reservas: total
        }));
      
      case 'comensales_dia':
        return Object.entries(dataObj.por_dia || {}).map(([fecha, total]) => ({
          fecha: new Date(fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
          comensales: total
        }));
      
      case 'estados_mesas':
        return Object.entries(dataObj.por_estado || {}).map(([estado, cantidad]) => ({
          estado: estado === 'free' ? 'Libre' : 
                 estado === 'occupied' ? 'Ocupada' : 
                 estado === 'reserved' ? 'Reservada' : 'Limpieza',
          cantidad,
          color: estado === 'free' ? colors.success : 
                estado === 'occupied' ? colors.error : 
                estado === 'reserved' ? colors.warning : colors.gray
        }));
      
      default:
        return [];
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = colors.primary, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          {trend > 0 ? (
            <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
          ) : trend < 0 ? (
            <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
          ) : (
            <Minus className="w-4 h-4 text-gray-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {Math.abs(trend)}% vs período anterior
          </span>
        </div>
      )}
    </div>
  );

  const SectionCard = ({ title, icon: Icon, expanded, onToggle, children, color = colors.primary }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
      <div 
        className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20' }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </div>
      {expanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p className="text-lg font-medium text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  const reservasData = prepareChartData(data?.reservas, 'reservas_dia');
  const comensalesData = prepareChartData(data?.comensales, 'comensales_dia');
  const estadosData = prepareChartData(data?.reservas, 'estados_mesas');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Reportes</h1>
              <p className="text-lg text-gray-600">Análisis completo del rendimiento del restaurante</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 lg:mt-0">
              {/* Controles de fecha */}
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border-none outline-none text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border-none outline-none text-sm"
                />
              </div>
              
              {/* Botones de acción */}
              <button
                onClick={fetchData}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
              
              <button
                onClick={generatePDF}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow text-white transition-colors"
                style={{ backgroundColor: colors.primary }}
              >
                <Download className="w-4 h-4" />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cards de resumen */}
        <SectionCard
          title="Resumen General"
          icon={BarChart3}
          expanded={expandedSections.resumen}
          onToggle={() => toggleSection('resumen')}
          color={colors.dark}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Reservas"
              value={Object.values(data?.reservas?.por_dia || {}).reduce((a, b) => a + b, 0)}
              icon={Calendar}
              trend={12}
              color={colors.primary}
              subtitle="Este período"
            />
            <StatCard
              title="Platos Más Populares"
              value={data?.ordenes?.top_platos?.length || 0}
              icon={UtensilsCrossed}
              trend={8}
              color={colors.secondary}
              subtitle="Diferentes platos"
            />
            <StatCard
              title="Promedio Comensales"
              value={Math.round(data?.comensales?.tamano_promedio || 0)}
              icon={Users}
              trend={-3}
              color={colors.accent}
              subtitle="Por grupo"
            />
            <StatCard
              title="Total Comensales"
              value={Object.values(data?.comensales?.por_dia || {}).reduce((a, b) => a + b, 0)}
              icon={Activity}
              trend={15}
              color={colors.success}
              subtitle="Este período"
            />
          </div>
        </SectionCard>

        {/* Sección de Reservas */}
        <SectionCard
          title="Análisis de Reservas"
          icon={Calendar}
          expanded={expandedSections.reservas}
          onToggle={() => toggleSection('reservas')}
          color={colors.primary}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de reservas por día */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Reservas por Día</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reservasData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: `1px solid ${colors.primary}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reservas" 
                    stroke={colors.primary}
                    fill={colors.primary + '40'}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Estado de las mesas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Estado Actual de Mesas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadosData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="cantidad"
                    label={(entry) => `${entry.estado}: ${entry.cantidad}`}
                  >
                    {estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </SectionCard>

        {/* Sección de Órdenes */}
        <SectionCard
          title="Análisis de Órdenes y Menú"
          icon={UtensilsCrossed}
          expanded={expandedSections.ordenes}
          onToggle={() => toggleSection('ordenes')}
          color={colors.secondary}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top platos */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Platos Más Populares</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.ordenes?.top_platos?.slice(0, 8) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="nombre" 
                    stroke="#6b7280" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: `1px solid ${colors.secondary}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="cantidad" 
                    fill={colors.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Lista detallada */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Ranking Detallado</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data?.ordenes?.top_platos?.map((plato, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: index < 3 ? colors.accent : colors.gray }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{plato.nombre}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold" style={{ color: colors.secondary }}>
                        {plato.cantidad}
                      </span>
                      <span className="text-sm text-gray-500">unidades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Sección de Comensales */}
        <SectionCard
          title="Análisis de Comensales"
          icon={Users}
          expanded={expandedSections.comensales}
          onToggle={() => toggleSection('comensales')}
          color={colors.accent}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de comensales por día */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Comensales por Día</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comensalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: `1px solid ${colors.accent}`,
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="comensales" 
                    stroke={colors.accent}
                    strokeWidth={3}
                    dot={{ fill: colors.accent, strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Métricas de comensales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Métricas de Grupo</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tamaño promedio de grupo</span>
                    <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {(data?.comensales?.tamano_promedio || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total de comensales</span>
                    <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {Object.values(data?.comensales?.por_dia || {}).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Promedio diario</span>
                    <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {Math.round(Object.values(data?.comensales?.por_dia || {}).reduce((a, b) => a + b, 0) / 
                        Object.keys(data?.comensales?.por_dia || {}).length || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Controles de exportación */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Opciones de Exportación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Secciones a incluir:</h3>
              <div className="space-y-2">
                {Object.entries(selectedSections).map(([section, selected]) => (
                  <label key={section} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => setSelectedSections(prev => ({
                        ...prev,
                        [section]: e.target.checked
                      }))}
                      className="w-4 h-4 rounded border-gray-300"
                      style={{ accentColor: colors.primary }}
                    />
                    <span className="text-gray-700 capitalize">{section}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generatePDF}
                disabled={!Object.values(selectedSections).some(Boolean)}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                  Object.values(selectedSections).some(Boolean) 
                    ? 'hover:opacity-90' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                style={{ backgroundColor: colors.primary }}
              >
                <FileText className="w-5 h-5" />
                <span>Generar Reporte PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
