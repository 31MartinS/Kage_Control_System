import { useEffect, useRef } from "react";
import butterup from "butteruptoasts";

export default function NotificacionesSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket("ws://localhost:8000/ws/notifications");
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("🟢 WS conectado");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "order_created") {
            butterup.toast({ title: "Nueva orden", message: `#${data.order_id} para llegada #${data.arrival_id}.`, type: "info" });
          }
          if (data.event === "order_status_changed") {
            butterup.toast({ title: "Estado pedido", message: `#${data.order_id} → ${data.status}`, type: "success" });
          }
        } catch (err) {
          console.error("❌ Parse WS:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WS error:", err);
      };

      socket.onclose = (e) => {
        console.warn("🔴 WS cerrado, reconectando en 3s...", e.code, e.reason);
        setTimeout(connect, 1000);
      };
    };

    connect();
    return () => socketRef.current?.close();
  }, []);

  return null;
}
