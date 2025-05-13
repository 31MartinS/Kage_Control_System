import React from 'react';

const options = [
  { icon: '📊', label: 'Ver reportes y estadísticas', path: '/admin/reportes' },
  { icon: '👥', label: 'Gestionar usuarios y roles',       path: '/admin/usuarios' },
  { icon: '📦', label: 'Supervisar inventario',           path: '/admin/inventario' },
  { icon: '📄', label: 'Exportar informes',               path: '/admin/informes' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-blue-900">Administrador</h1>
      <div className="space-y-3">
        {options.map(({ icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition"
          >
            <span className="mr-2 text-xl">{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
