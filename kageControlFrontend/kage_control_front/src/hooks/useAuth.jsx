// src/hooks/useAuth.js
import { useState, useContext, createContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // simulamos login: en prod reemplaza con llamada a tu API
  const login = async ({ username, password }) => {
    // aquí podrías fetch("/api/login", { username, password })
    // y obtener { username, role, token… }
    // por ahora, simulamos:
    let role = null;
    switch (password) {
      case "meseropass":
        role = "mesero";
        break;
      case "adminpass":
        role = "admin";
        break;
      case "cocinapass":
        role = "cocina";
        break;
      default:
        throw new Error("Credenciales inválidas");
    }

    setUser({ username, role });
  };

  const logout = () => {
    setUser(null);
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

export function useRole() {
  return useAuth().user?.role;
}

export function useUser() {
  return useAuth().user;
}
