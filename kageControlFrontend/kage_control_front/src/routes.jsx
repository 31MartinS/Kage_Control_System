import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { useAuth } from "./hooks/useAuth";

// Mesero
import RegistrarLlegada from "./pages/roles/Mesero/RegistrarLlegada";
import Ordenes from "./pages/roles/Mesero/Ordenes";
import PlanoMesas from "./pages/roles/Mesero/PlanoMesas";
import SeguimientoPedidos from "./pages/roles/Mesero/SeguimientoPedidos";

// Admin
import Reportes from "./pages/roles/Admin/Reportes";
import Usuarios from "./pages/roles/Admin/Usuarios";
import Inventario from "./pages/roles/Admin/Inventario";
import Informes from "./pages/roles/Admin/Informes";

// Cocina
import Pedidos from "./pages/roles/Cocina/Pedidos";
import Estado from "./pages/roles/Cocina/Estado";
import Notas from "./pages/roles/Cocina/Notas";

// Página protegida por rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Mesero */}
        <Route
          path="/mesero/*"
          element={
            <ProtectedRoute allowedRoles={["mesero"]}>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route path="registrar" element={<RegistrarLlegada />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="plano" element={<PlanoMesas />} />
          <Route path="seguimiento" element={<SeguimientoPedidos />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route path="reportes" element={<Reportes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="informes" element={<Informes />} />
        </Route>

        {/* Cocina */}
        <Route
          path="/cocina/*"
          element={
            <ProtectedRoute allowedRoles={["cocina"]}>
              <Home />
            </ProtectedRoute>
          }
        >
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="estado" element={<Estado />} />
          <Route path="notas" element={<Notas />} />
        </Route>

        {/* Ruta raíz: redirige al dashboard según rol */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin", "mesero", "cocina"]}>
              <RedirectByRole />
            </ProtectedRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Redirecciona al dashboard inicial según el rol
function RedirectByRole() {
  const { user } = useAuth();

  if (user?.role === "mesero") return <Navigate to="/mesero/registrar" />;
  if (user?.role === "admin") return <Navigate to="/admin/reportes" />;
  if (user?.role === "cocina") return <Navigate to="/cocina/pedidos" />;
  return <Navigate to="/unauthorized" />;
}

// Página para usuarios no autorizados
function Unauthorized() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl text-red-500 font-bold mb-2">403</h1>
        <p className="text-gray-700">No tienes permiso para acceder a esta página.</p>
      </div>
    </div>
  );
}
