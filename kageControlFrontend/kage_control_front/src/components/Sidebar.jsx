import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import NotificacionesSocket from "./NotificacionesSocket";
import {
  ConciergeBell,
  UtensilsCrossed,
  Map,
  Search,
  BarChart3,
  Users,
  Package,
  FileText,
  BellRing,
  Clock,
  ClipboardList,
  LogOut,
  LayoutTemplate,
  Menu as MenuIcon,
} from "lucide-react";

const OPTIONS = {
  mesero: [
    { icon: <ConciergeBell className="w-5 h-5 mr-2" />, label: "Registrar llegada", to: "/mesero/registrar" },
    { icon: <UtensilsCrossed className="w-5 h-5 mr-2" />, label: "Órdenes", to: "/mesero/ordenes" },
    { icon: <Map className="w-5 h-5 mr-2" />, label: "Plano de mesas", to: "/mesero/plano" },
    { icon: <Search className="w-5 h-5 mr-2" />, label: "Seguimiento", to: "/mesero/seguimiento" },
  ],
  admin: [
    { icon: <BarChart3 className="w-5 h-5 mr-2" />, label: "Reportes y estadísticas", to: "/admin/reportes" },
    { icon: <Users className="w-5 h-5 mr-2" />, label: "Usuarios y roles", to: "/admin/usuarios" },
    { icon: <Package className="w-5 h-5 mr-2" />, label: "Inventario", to: "/admin/inventario" },
    { icon: <FileText className="w-5 h-5 mr-2" />, label: "Exportar informes", to: "/admin/informes" },
    { icon: <LayoutTemplate className="w-5 h-5 mr-2" />, label: "Editor de mesas", to: "/admin/mesas" },
  ],
  cocina: [
    { icon: <BellRing className="w-5 h-5 mr-2" />, label: "Pedidos por estación", to: "/cocina/pedidos" },
    { icon: <Clock className="w-5 h-5 mr-2" />, label: "Actualizar platillos", to: "/cocina/estado" },
    { icon: <ClipboardList className="w-5 h-5 mr-2" />, label: "Notas dietéticas", to: "/cocina/notas" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout(); // ✅ Usa el método del contexto
    navigate("/login", { replace: true });
  };

  const sidebarBg = "bg-[#264653]";
  const highlight = "bg-[#3BAEA0]";
  const logoutBg = "bg-[#8D2E38] hover:bg-[#731c2a]";
  const sidebarWidth = expanded ? "w-64" : "w-16";

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#264653] text-white p-2 rounded-full shadow"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú lateral"
      >
        <MenuIcon size={28} />
      </button>

      {/* Sidebar vertical */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`
          fixed top-0 left-0 h-screen z-40 ${sidebarBg} text-white transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          ${sidebarWidth} flex flex-col items-center md:items-stretch shadow-xl
        `}
        style={{ minWidth: expanded ? "16rem" : "4rem" }}
      >
        {/* Cerrar en móvil */}
        <div className="flex md:hidden justify-end mt-4 mr-4">
          <button
            className="text-white text-2xl"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú lateral"
          >
            ×
          </button>
        </div>
        {/* Bienvenida moderna, sin logo */}
        <div className={`flex flex-col items-center mb-4 mt-4 px-2`}>
          {expanded && (
            <p className="text-center font-sans text-2xl font-extrabold text-[#F4A261] mb-1 tracking-tight">
              ¡Bienvenido, <span className="text-white">{user.username}</span>!
            </p>
          )}
        </div>
        {/* Notificaciones */}
        {expanded && <div className="px-2 w-full mb-3"><NotificacionesSocket /></div>}

        {/* Opciones dinámicas */}
        <nav className="flex-1 flex flex-col gap-1 mt-1">
          {OPTIONS[role]?.map(({ icon, label, to }, index) => (
            <Link
              key={index}
              to={to}
              className={`
                flex items-center gap-3 py-2 px-2 mx-2 rounded-lg cursor-pointer
                hover:${highlight} transition-all
                ${expanded ? "justify-start" : "justify-center"}
                ${location.pathname === to ? highlight : ""}
              `}
              onClick={() => setMobileOpen(false)} // Cierra drawer en móvil
            >
              <span className="text-xl">{icon}</span>
              {expanded && <span className="text-base font-medium">{label}</span>}
            </Link>
          ))}
        </nav>
        {/* Botón cerrar sesión SIEMPRE visible, tamaño fijo, icono siempre, texto solo expandido */}
        <div className={`mb-8 px-2 w-full flex justify-center`}>
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 py-2 px-2 rounded-lg ${logoutBg}
              ${expanded ? "w-full justify-start" : "w-12 justify-center"} 
              text-white font-semibold transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-[#F4A261]
            `}
            type="button"
            tabIndex={0}
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
            {expanded && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Fondo oscuro para drawer móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Para que el contenido principal no quede debajo del sidebar */}
      <div className={`transition-all duration-300 ${expanded ? "md:ml-64" : "md:ml-16"}`} />
    </>
  );
}
