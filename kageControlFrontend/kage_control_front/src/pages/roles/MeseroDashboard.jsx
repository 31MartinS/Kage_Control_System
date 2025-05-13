import React from 'react';

const options = [
  { icon: '📥', label: 'Registrar llegada de comensales', path: '/mesero/registrar-llegada' },
  { icon: '🍽️', label: 'Crear y modificar órdenes',        path: '/mesero/ordenes' },
  { icon: '🗺️', label: 'Visualizar plano de mesas',         path: '/mesero/plano-mesas' },
  { icon: '🔍', label: 'Seguimiento de pedidos',             path: '/mesero/seguimiento' },
];

export default function MeseroDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-blue-900">Mesero</h1>
      <div className="space-y-3">
        {options.map(({ icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
          >
            <span className="mr-2 text-xl">{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
