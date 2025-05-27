// MeseroDashboard.jsx - Actualizado con Lucide Icons y estilo gourmet
import React from 'react';
import { ConciergeBell, UtensilsCrossed, Map, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const options = [
  { icon: <ConciergeBell className="w-5 h-5 mr-3" />, label: 'Registrar llegada de comensales', path: '/mesero/registrar-llegada' },
  { icon: <UtensilsCrossed className="w-5 h-5 mr-3" />, label: 'Crear y modificar órdenes', path: '/mesero/ordenes' },
  { icon: <Map className="w-5 h-5 mr-3" />, label: 'Visualizar plano de mesas', path: '/mesero/plano-mesas' },
  { icon: <Search className="w-5 h-5 mr-3" />, label: 'Seguimiento de pedidos', path: '/mesero/seguimiento' },
];

export default function MeseroDashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-serif font-bold text-[#8D2E38]">Panel del Mesero</h1>
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
