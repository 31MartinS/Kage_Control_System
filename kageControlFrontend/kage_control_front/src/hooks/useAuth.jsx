// src/hooks/useAuth.jsx
import { useState, useContext, createContext } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async ({ username, password }) => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const res = await axiosClient.post("/auth/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const token = res.data.access_token;
    localStorage.setItem("token", token);

    // Decodifica el JWT manualmente
    const payload = parseJwt(token);
    setUser({ username: payload.sub, role: payload.role });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// **YA EXPORTAMOS** useRole y useUser
export function useRole() {
  const { user } = useAuth();
  return user?.role;
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

// Función para parsear JWT sin librerías
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return {};
  }
}
