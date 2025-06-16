import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function Ordenes() {
  const [arrivalId, setArrivalId] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [menu, setMenu] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [ordenes, setOrdenes] = useState([]);

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
    if (!arrivalId) {
      butterup.toast({
        title: "Error",
        message: "Por favor selecciona un arrival antes de confirmar la orden.",
        icon: "x",
        style: "error",
      });
      return;
    }

    const dishes = Object.values(carrito).map((item) => ({
      dish_id: item.id,
      quantity: item.cantidad,
    }));

    if (dishes.length === 0) {
      butterup.toast({
        title: "Carrito vacío",
        message: "Agrega al menos un platillo antes de confirmar.",
        icon: "x",
        style: "error",
      });
      return;
    }

    const data = {
      arrival_id: parseInt(arrivalId),
      station: "cocina",
      notes: "",
      dishes,
    };

    try {
      console.log("Enviando orden:", data); // DEBUG

      await axios.post("http://localhost:8000/orders/", data);

      setCarrito({});
      butterup.toast({
        title: "Orden Confirmada",
        message: "La orden fue enviada correctamente ✅",
        icon: "check",
        style: "success",
      });
      cargarOrdenes();
    } catch (error) {
      console.error("Error al enviar orden:", error);
      console.log("Detalle del error:", error.response?.data); // DEBUG
      butterup.toast({
        title: "Error",
        message: error.response?.data?.detail || "Error al enviar la orden ❌",
        icon: "x",
        style: "error",
      });
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8000/arrivals/");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const cargarMenu = async () => {
    try {
      const res = await axios.get("http://localhost:8000/menu/available/");
      setMenu(res.data);
    } catch (error) {
      console.error("Error al cargar el menú:", error);
    }
  };

  const cargarOrdenes = async () => {
    if (!arrivalId) return;
    try {
      const res = await axios.get(`http://localhost:8000/orders/${arrivalId}`);
      setOrdenes(res.data);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (arrivalId) {
      cargarMenu();
      cargarOrdenes();
    }
  }, [arrivalId]);

  return (
    <div className="p-6 space-y-6 bg-[#FFF8F0] rounded-3xl shadow-xl">
      <div className="mb-4">
        <label className="text-lg font-medium text-[#264653]">Selecciona un usuario:</label>
        <select
          className="block w-full mt-2 p-2 rounded-lg border border-gray-300"
          value={arrivalId || ""}
          onChange={(e) => setArrivalId(e.target.value)}
        >
          <option value="">-- Selecciona un arrival --</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.customer_name || `Mesa ${u.id}`}
            </option>
          ))}
        </select>
      </div>

      {arrivalId && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menú */}
          <section className="flex-1 space-y-4">
            <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">Menú</h1>
            <div className="grid md:grid-cols-2 gap-4">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-2xl shadow-md border border-[#EADBC8]"
                >
                  <div>
                    <p className="text-[#4D4D4D] font-semibold text-lg">{item.name}</p>
                    <p className="text-gray-500 text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() =>
                      addItem({
                        id: item.id,
                        nombre: item.name,
                        precio: item.price,
                      })
                    }
                    className="mt-4 w-full py-2 bg-[#264653] hover:bg-[#1b3540] text-white rounded-full"
                  >
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Carrito + Órdenes */}
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
                  <p className="text-sm text-[#4D4D4D]">Orden #{order.id}</p>
                  <p className="text-xs text-gray-500">Estado: {order.status}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
