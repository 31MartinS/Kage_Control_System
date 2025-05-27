// 🎨 ORDENES - Estilo Gourmet Aplicado
import { useEffect, useState } from "react";
import axios from "axios";

const MENU = [
  { id: 1, nombre: "Sushi", precio: 8.5, station: "cocina" },
  { id: 2, nombre: "Ramen", precio: 5.0, station: "cocina" },
  { id: 3, nombre: "Tempura", precio: 12.0, station: "cocina" },
  { id: 4, nombre: "Yakitori", precio: 6.0, station: "barra" },
];

const arrivalId = 1;

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
          notes: "",
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
    <div className="flex flex-col lg:flex-row bg-[#FFF8F0] p-6 rounded-3xl shadow-xl gap-6">
      <section className="flex-1 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Menú</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {MENU.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between border border-[#EADBC8]"
            >
              <div>
                <p className="text-[#4D4D4D] font-semibold text-lg">{item.nombre}</p>
                <p className="text-gray-500 text-sm">${item.precio.toFixed(2)}</p>
              </div>
              <button
                onClick={() => addItem(item)}
                className="mt-4 w-full py-2 bg-[#264653] hover:bg-[#1b3540] text-white rounded-full font-medium transition"
              >
                + Agregar
              </button>
            </div>
          ))}
        </div>
      </section>

      <aside className="w-full lg:w-1/3 bg-white p-6 rounded-2xl shadow-md border border-[#EADBC8] flex flex-col">
        <h2 className="text-2xl font-serif font-semibold text-[#8D2E38] mb-4">Carrito</h2>
        {Object.values(carrito).length === 0 ? (
          <p className="text-gray-500">No hay ítems en el carrito.</p>
        ) : (
          <>
            <ul className="flex-1 overflow-auto space-y-3">
              {Object.values(carrito).map((it) => (
                <li key={it.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-[#4D4D4D] font-medium">{it.nombre}</p>
                    <p className="text-gray-500 text-sm">
                      {it.cantidad} × ${it.precio.toFixed(2)} = ${(it.precio * it.cantidad).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => removeItem(it.id)}
                      className="px-3 py-1 bg-[#8D2E38] hover:bg-[#731c2a] text-white rounded-full"
                    >
                      –
                    </button>
                    <button
                      onClick={() => addItem(it)}
                      className="px-3 py-1 bg-[#264653] hover:bg-[#1b3540] text-white rounded-full"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[#4D4D4D] font-medium">Total:</span>
                <span className="text-[#8D2E38] font-bold text-lg">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={confirmarOrden}
                className="w-full py-3 bg-[#264653] hover:bg-[#1b3540] text-white rounded-full font-medium transition"
              >
                Confirmar Orden
              </button>
            </div>
          </>
        )}

        <h3 className="text-xl font-serif font-semibold text-[#8D2E38] mt-6 mb-2">Órdenes Enviadas</h3>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {ordenes.map((order) => (
            <li key={order.id} className="border border-[#EADBC8] p-3 rounded-xl bg-[#FFF]">
              <p className="text-sm text-[#4D4D4D]">
                {order.quantity} × {order.item}
              </p>
              <p className="text-xs text-gray-500">Estado: {order.status}</p>
            </li>
          ))}
        </ul>

        {mensaje && <p className="mt-4 text-center text-[#3BAEA0] font-medium">{mensaje}</p>}
      </aside>
    </div>
  );
}
