// src/api/websocketClient.js
export function connectWebSocket(path = '/ws/tables', onMessage, onError, onClose) {
  const socket = new WebSocket(`ws://localhost:8000${path}`);

  socket.onopen = () => console.log('WebSocket conectado a:', path);
  socket.onmessage = (evt) => onMessage && onMessage(JSON.parse(evt.data));
  socket.onerror   = (err) => onError   && onError(err);
  socket.onclose   = (ev)  => onClose   && onClose(ev);

  return socket;
}
