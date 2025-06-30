// src/components/NotificacionesSocket.jsx
import { useEffect, useRef } from "react";
import butterup from "butteruptoasts";

// 🙅‍♂️ Evita notificar dos veces el mismo evento
const shownNotifications = new Set();

// Construye una clave única por evento y orden (y llegada)
const buildKey = (data) =>
  `${data.event}-${data.order_id}-${data.arrival_id ?? ""}`;

export default function NotificacionesSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    // Abre la conexión WebSocket
    const connect = () => {
      const socket = new WebSocket("ws://localhost:8000/ws/notifications");
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("🟢 WS conectado");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const key = buildKey(data);

          // Si ya mostramos esta notificación, la ignoramos
          if (shownNotifications.has(key)) {
            console.log("⚠️ Notificación duplicada ignorada:", key);
            return;
          }

          // Marcamos que ya la mostramos
          shownNotifications.add(key);

          // Mostramos el toast correspondiente
          if (data.event === "order_created") {
            butterup.toast({
              title: "Nueva orden",
              message: `#${data.order_id} para llegada #${data.arrival_id}.`,
              type: "info",
            });
          }

          if (data.event === "order_status_changed") {
            butterup.toast({
              title: "Estado pedido",
              message: `#${data.order_id} → ${data.status}`,
              type: "success",
            });
          }
        } catch (err) {
          console.error("❌ Parse WS:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WS error:", err);
      };

      socket.onclose = () => {
        console.warn("🔴 WS cerrado, reconectando en 3s...");
        setTimeout(connect, 3000);
      };
    };

    connect();

    // Limpia el registro de notificaciones cada 5 minutos para no acumular memoria
    const cleanupInterval = setInterval(() => {
      shownNotifications.clear();
      console.log("🧹 shownNotifications limpiado");
    }, 5 * 60 * 1000);

    return () => {
      socketRef.current?.close();
      clearInterval(cleanupInterval);
    };
  }, []);

  return null;
}
