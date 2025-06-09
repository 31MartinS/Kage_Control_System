import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { connectWebSocket } from "../api/websocketClient";

export function useTablesSocket() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    let isMounted = true;

    // Traemos el estado inicial con REST
    const fetchInitialTables = async () => {
      try {
        const res = await axiosClient.get("/tables");
        if (isMounted && Array.isArray(res.data)) {
          setTables(res.data);
        }
      } catch (err) {
        console.error("Error fetching initial tables:", err);
      }
    };

    fetchInitialTables();

    // Abrimos WebSocket usando tu helper
    const socket = connectWebSocket(
      "/ws/tables",
      (data) => {
        if (data.event === "update_tables" && Array.isArray(data.tables)) {
          setTables(data.tables);
        }
      },
      (err) => console.error("WS error:", err),
      (ev) => console.log("WS closed:", ev)
    );

    return () => {
      isMounted = false;
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return tables;
}
