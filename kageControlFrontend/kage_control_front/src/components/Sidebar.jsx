import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.png";
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
} from "lucide-react";

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const options = {
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

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="bg-[#FFF8F0] h-screen w-80 flex flex-col justify-between border-r border-[#EADBC8] shadow-md">
      <div>
        {/* Logo */}
        <div className="flex justify-center mt-6 mb-4">
          <img src={Logo} alt="KageControl" className="w-28" />
        </div>

        {/* Saludo */}
        <p className="text-center text-[#4D4D4D] font-serif text-lg font-semibold mb-6">
          Bienvenido, {user.username}
        </p>

        {/* Opciones */}
        <div className="flex flex-col items-center space-y-3">
          {options[role]?.map(({ icon, label, to }, index) => (
            <Link
              key={index}
              to={to}
              className="w-11/12 px-5 py-3 rounded-full text-white bg-[#264653] hover:bg-[#1b3540] transition flex items-center justify-center shadow-sm font-medium tracking-wide"
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Botón cerrar sesión */}
      <div className="flex justify-center mt-4 mb-8">
        <button
          onClick={handleLogout}
          className="w-11/12 px-5 py-3 rounded-full bg-[#8D2E38] hover:bg-[#731c2a] text-white flex items-center justify-center font-semibold tracking-wide shadow-sm"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
