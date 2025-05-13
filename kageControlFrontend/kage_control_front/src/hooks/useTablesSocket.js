import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { connectWebSocket } from "../api/websocketClient";

export function useTablesSocket() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // 1) Obtenemos estado inicial vía HTTP
    axiosClient
      .get("/tables")
      .then((res) => {
        setTables(res.data);
      })
      .catch((err) => {
        console.error("Error fetching initial tables:", err);
      });

    // 2) Abrimos WS para actualizaciones
    const socket = connectWebSocket(
      "/ws/tables",
      (data) => {
        if (data.event === "update_tables") {
          setTables(data.tables);
        }
      },
      (err) => console.error("WS error:", err),
      (ev) => console.log("WS closed:", ev)
    );

    // 3) Limpiamos al desmontar
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return tables;
}
