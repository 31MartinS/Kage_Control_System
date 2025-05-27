import React from 'react';
import { BarChart3, Users, Package, FileText, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const options = [
  { icon: <BarChart3 className="w-5 h-5 mr-3" />, label: 'Ver reportes y estadísticas', path: '/admin/reportes' },
  { icon: <Users className="w-5 h-5 mr-3" />, label: 'Gestionar usuarios y roles', path: '/admin/usuarios' },
  { icon: <Package className="w-5 h-5 mr-3" />, label: 'Supervisar inventario', path: '/admin/inventario' },
  { icon: <FileText className="w-5 h-5 mr-3" />, label: 'Exportar informes', path: '/admin/informes' },
  { icon: <LayoutTemplate className="w-5 h-5 mr-3" />, label: 'Editor de mesas', path: '/admin/mesas' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-serif font-bold text-[#8D2E38]">Panel del Administrador</h1>
      <div className="space-y-3">
        {options.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="w-full flex items-center px-5 py-3 rounded-full bg-[#264653] hover:bg-[#1b3540] text-white shadow-sm transition font-medium tracking-wide"
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
