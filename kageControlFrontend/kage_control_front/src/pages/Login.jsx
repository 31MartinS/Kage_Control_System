import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("mesero");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ username, role });
    navigate("/"); // Redirige a Home
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-blue-900 mb-6">Iniciar sesión</h1>

        <label className="block mb-2 text-gray-700">Nombre de usuario</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="block mb-2 text-gray-700">Seleccionar rol</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-6"
        >
          <option value="mesero">Mesero</option>
          <option value="admin">Administrador</option>
          <option value="cocina">Cocina</option>
        </select>

        <button
          type="submit"
          className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
