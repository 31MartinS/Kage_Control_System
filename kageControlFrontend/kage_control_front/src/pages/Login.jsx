import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import butterup from "butteruptoasts";
import "../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (type, title, message) => {
    butterup.toast({
      title,
      message,
      location: "top-right",
      icon: false,
      dismissable: true,
      type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ username, password });

      showToast(
        "success",
        `¡Hola, ${data?.nombreUsuario || username}!`,
        "Bienvenido al panel de administración."
      );

      navigate("/");
    } catch (err) {
      console.error("Login error full:", err);
      const detail = err.response?.data?.detail;

      let message = "Error desconocido al iniciar sesión";

      if (Array.isArray(detail)) {
        message = detail.map((d) => d.msg).join("; ");
      } else if (typeof detail === "string") {
        message = detail;
      }

      setError(message);
      showToast("error", "Error al iniciar sesión", message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-[#EADBC8]"
      >
        <h1 className="text-3xl font-serif font-semibold text-[#8D2E38] mb-6 text-center">
          Bienvenido a La Llama Gourmet
        </h1>

        {error && (
          <p className="text-red-500 mb-4 text-center whitespace-pre-wrap">
            {error}
          </p>
        )}

        <div className="mb-5">
          <label className="block text-[#4D4D4D] mb-1 font-medium">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Tu usuario"
            className="w-full px-4 py-3 border border-[#E6D5C3] rounded-full focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[#4D4D4D] mb-1 font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-[#E6D5C3] rounded-full focus:outline-none focus:ring-2 focus:ring-[#E76F51]"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#E76F51] hover:bg-[#D45B3C] text-white rounded-full font-semibold tracking-wide transition"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
