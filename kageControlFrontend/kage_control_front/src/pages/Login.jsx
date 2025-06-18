import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import butterup from "butteruptoasts";
import Logo from "../assets/logo.png";
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF8F0] font-sans">
      {/* Logo gourmet, más pequeño y arriba */}
      <div className="flex flex-col items-center mb-[-2rem] z-10" style={{ marginTop: '-2rem' }}>
        <img
          src={Logo}
          alt="La Llama Gourmet"
          className="w-32 md:w-36 drop-shadow-xl bg-white rounded-full p-3 border-4 border-[#3BAEA0]"
          draggable={false}
          style={{
            marginBottom: "-1.2rem",
            background: "#fff",
          }}
        />
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 pt-16 rounded-3xl shadow-2xl w-full max-w-md border-2 border-[#3BAEA0] flex flex-col items-center animate-fade-in"
        style={{ animation: "fade-in 0.7s" }}
      >
        <h1 className="text-3xl font-extrabold text-[#259d9d] mb-8 text-center tracking-tight font-sans drop-shadow">
          Bienvenido a La Llama Gourmet
        </h1>

        {error && (
          <p className="text-[#3BAEA0] mb-4 text-center whitespace-pre-wrap font-bold">
            {error}
          </p>
        )}

        <div className="mb-6 w-full">
          <label className="block text-[#264653] mb-1 font-bold text-lg">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Tu usuario"
            className="w-full px-6 py-4 border-2 border-[#3BAEA0] rounded-full focus:outline-none focus:ring-2 focus:ring-[#259d9d] font-semibold shadow-lg text-lg"
          />
        </div>

        <div className="mb-10 w-full">
          <label className="block text-[#264653] mb-1 font-bold text-lg">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-6 py-4 border-2 border-[#3BAEA0] rounded-full focus:outline-none focus:ring-2 focus:ring-[#259d9d] font-semibold shadow-lg text-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-full font-extrabold text-lg tracking-wide shadow-xl transition
            bg-[#259d9d] hover:bg-[#197e7e] duration-200 text-white"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}

/* Puedes agregar esta animación en tu CSS global si lo deseas:
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.97);}
  to   { opacity: 1; transform: scale(1);}
}
*/
