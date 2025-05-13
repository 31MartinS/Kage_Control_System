// src/pages/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
// Importa todo lo que exporte butterup y calculamos un toast seguro
import * as butterUp from "butterup";

const toast = butterUp.toast ?? butterUp;  // si toast no existe, butterUp itself podría ser la función

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const safeSuccess = (msg) => {
    if (typeof toast.success === "function") toast.success(msg);
  };
  const safeError = (msg) => {
    if (typeof toast.error === "function") toast.error(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login({ username, password });
      safeSuccess("Inicio de sesión exitoso 👌");
      navigate("/");
    } catch (err) {
      console.error("Login error full:", err);
      const detail = err.response?.data?.detail;
      console.log("Detail from backend:", detail);

      let message = "Error desconocido al iniciar sesión";

      if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg).join("; ");
      } else if (typeof detail === "string") {
        message = detail;
      }

      setError(message);
      safeError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold text-blue-900 mb-6 text-center">
          Iniciar sesión
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-center whitespace-pre-wrap">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Tu usuario"
            className="w-full px-4 py-2 border rounded-full focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 border rounded-full focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
