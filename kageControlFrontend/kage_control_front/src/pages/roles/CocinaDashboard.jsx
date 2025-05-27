import React from 'react';
import { BellRing, Clock, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const options = [
  { icon: <BellRing className="w-5 h-5 mr-3" />, label: 'Ver pedidos por estación', path: '/cocina/pedidos' },
  { icon: <Clock className="w-5 h-5 mr-3" />, label: 'Actualizar estado de platillos', path: '/cocina/estado' },
  { icon: <ClipboardList className="w-5 h-5 mr-3" />, label: 'Consultar notas dietéticas', path: '/cocina/notas' },
];

export default function CocinaDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-serif font-bold text-[#8D2E38]">Panel de Cocina</h1>
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
