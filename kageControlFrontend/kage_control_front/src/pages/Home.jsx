// src/pages/Home.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth, useRole, useUser } from "../hooks/useAuth";

export default function Home() {
  const role = useRole();

  if (!role) return <p>Sin rol definido</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-10 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
