import React from 'react';

const options = [
  { icon: '🔔', label: 'Ver pedidos por estación',   path: '/cocina/pedidos' },
  { icon: '🕒', label: 'Actualizar estado de platillos', path: '/cocina/estado' },
  { icon: '📋', label: 'Consultar notas dietéticas', path: '/cocina/notas' },
];

export default function CocinaDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-blue-900">Cocina</h1>
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
