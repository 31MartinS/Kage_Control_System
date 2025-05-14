import { useEffect, useState } from "react";
import axios from "axios";

const MENU = [
  { id: 1, nombre: "Ensalada César", precio: 8.5, station: "cocina" },
  { id: 2, nombre: "Sopa del día", precio: 5.0, station: "cocina" },
  { id: 3, nombre: "Filete a la plancha", precio: 12.0, station: "cocina" },
  { id: 4, nombre: "Postre del chef", precio: 6.0, station: "barra" },
];

const arrivalId = 1; // Ajusta esto según el arrival activo

export default function Ordenes() {
  const [carrito, setCarrito] = useState({});
  const [ordenes, setOrdenes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const addItem = (item) => {
    setCarrito((c) => ({
      ...c,
      [item.id]: {
        ...item,
        cantidad: (c[item.id]?.cantidad || 0) + 1,
      },
    }));
  };

  const removeItem = (id) => {
    setCarrito((c) => {
      const updated = { ...c };
      if (updated[id].cantidad > 1) {
        updated[id].cantidad--;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const total = Object.values(carrito).reduce(
    (sum, it) => sum + it.precio * it.cantidad,
    0
  );

  const confirmarOrden = async () => {
    try {
      for (const item of Object.values(carrito)) {
        await axios.post("http://localhost:8000/orders/", {
          arrival_id: arrivalId,
          item: item.nombre,
          quantity: item.cantidad,
          notes: "", // puedes agregar notas desde un input si quieres
          station: item.station,
        });
      }
      setCarrito({});
      setMensaje("Orden enviada correctamente ✅");
      cargarOrdenes();
    } catch (error) {
      console.error("Error al enviar orden:", error);
      setMensaje("Error al enviar la orden ❌");
    }
  };

  const cargarOrdenes = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/orders/${arrivalId}`);
      setOrdenes(res.data);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 p-6 rounded-lg shadow-lg gap-6">
      {/* Menú */}
      <section className="flex-1 space-y-4">
        <h1 className="text-2xl font-bold text-blue-900">Menú</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {MENU.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow flex flex-col justify-between"
            >
              <div>
                <p className="text-gray-800 font-medium">{item.nombre}</p>
                <p className="text-gray-500">${item.precio.toFixed(2)}</p>
              </div>
              <button
                onClick={() => addItem(item)}
                className="mt-4 w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded transition"
              >
                + Agregar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Carrito y Ordenes */}
      <aside className="w-full lg:w-1/3 bg-white p-4 rounded-lg shadow flex flex-col">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Carrito</h2>
        {Object.values(carrito).length === 0 ? (
          <p className="text-gray-500">No hay ítems en el carrito.</p>
        ) : (
          <>
            <ul className="flex-1 overflow-auto space-y-3">
              {Object.values(carrito).map((it) => (
                <li key={it.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-gray-800 font-medium">{it.nombre}</p>
                    <p className="text-gray-500 text-sm">
                      {it.cantidad} × ${it.precio.toFixed(2)} = ${(it.precio * it.cantidad).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => removeItem(it.id)}
                      className="px-2 py-1 bg-red-400 hover:bg-red-500 text-white rounded"
                    >
                      –
                    </button>
                    <button
                      onClick={() => addItem(it)}
                      className="px-2 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="text-gray-900 font-bold">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={confirmarOrden}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition"
              >
                Confirmar Orden
              </button>
            </div>
          </>
        )}

        {/* Órdenes existentes */}
        <h3 className="text-lg font-semibold text-blue-900 mt-6 mb-2">Órdenes Enviadas</h3>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {ordenes.map((order) => (
            <li key={order.id} className="border p-2 rounded">
              <p className="text-sm text-gray-700">
                {order.quantity} × {order.item}
              </p>
              <p className="text-xs text-gray-500">Estado: {order.status}</p>
            </li>
          ))}
        </ul>

        {/* Mensaje */}
        {mensaje && <p className="mt-4 text-center text-green-600">{mensaje}</p>}
      </aside>
    </div>
  );
}
