// src/api/axiosClient.js
import axios from "axios";

const BASE_URL = "http://localhost:8000"; // asegúrate de que coincide con tu FastAPI

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Si en un futuro necesitas enviar cookies de sesión:
  // withCredentials: true,
});

// Interceptor para inyectar el token JWT en cada petición
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
