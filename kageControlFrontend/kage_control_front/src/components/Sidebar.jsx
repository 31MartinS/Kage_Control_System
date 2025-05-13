import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.png";

export default function Sidebar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const options = {
    mesero: [
      { icon: "📥", label: "Registrar llegada", to: "/mesero/registrar" },
      { icon: "🍽️", label: "Órdenes", to: "/mesero/ordenes" },
      { icon: "🗺️", label: "Plano de mesas", to: "/mesero/plano" },
      { icon: "🔍", label: "Seguimiento", to: "/mesero/seguimiento" },
    ],
    admin: [
      { icon: "📊", label: "Ver reportes y estadísticas", to: "/admin/reportes" },
      { icon: "👥", label: "Gestionar usuarios y roles", to: "/admin/usuarios" },
      { icon: "📦", label: "Supervisar inventario", to: "/admin/inventario" },
      { icon: "📄", label: "Exportar informes", to: "/admin/informes" },
    ],
    cocina: [
      { icon: "🔔", label: "Ver pedidos por estación", to: "/cocina/pedidos" },
      { icon: "🕒", label: "Actualizar platillos", to: "/cocina/estado" },
      { icon: "📋", label: "Notas dietéticas", to: "/cocina/notas" },
    ],
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <aside className="bg-gray-200 h-screen w-80 flex flex-col justify-between">
      <div>
        {/* Logo */}
        <img src={Logo} alt="KageControl" className="w-24 mx-auto mb-4" />

        {/* Saludo */}
        <p className="text-center text-gray-700 font-medium mb-6">
          Bienvenido, {user.username}
        </p>

        {/* Botones según rol */}
        <div className="flex flex-col items-center space-y-2">
          {options[role]?.map(({ icon, label, to }, index) => (
            <Link
              key={index}
              to={to}
              className="w-11/12 px-4 py-2 rounded-full text-white bg-teal-500 hover:bg-teal-600 transition flex items-center justify-center"
            >
              <span className="mr-2 text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Botón de cerrar sesión */}
      <div className="flex justify-center mt-4 mb-6">
        <button
          onClick={handleLogout}
          className="w-11/12 px-4 py-2 rounded-full bg-red-400 hover:bg-red-500 text-white flex items-center justify-center"
        >
          🔄 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
