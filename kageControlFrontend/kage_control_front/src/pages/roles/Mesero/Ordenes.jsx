import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

const COLORS = {
  fondo: "bg-[#FFF8F0]",
  borde: "border-[#EADBC8]",
  sidebar: "bg-[#264653]",
  acento: "bg-[ ]",
  principal: "bg-[#8D2E38]",
  hoverAcento: "hover:bg-[#329b91]",
  boton: "bg-[#3BAEA0] hover:bg-[#329b91]",
  botonRojo: "bg-[#8D2E38] hover:bg-[#731c2a]",
};

export default function Ordenes() {
  const [arrivalId, setArrivalId] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [menu, setMenu] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [ordenes, setOrdenes] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  // MODAL de confirmación
  const confirmarOrden = () => {
    if (!arrivalId) {
      butterup.toast({
        title: "Error",
        message: "Por favor selecciona un arrival antes de confirmar la orden.",
        type: "error",
        dismissable: true,
      });
      return;
    }
    if (Object.values(carrito).length === 0) {
      butterup.toast({
        title: "Carrito vacío",
        message: "Agrega al menos un platillo antes de confirmar.",
        type: "error",
        dismissable: true,
      });
      return;
    }
    setShowModal(true);
  };

  const enviarOrden = async () => {
    setShowModal(false);
    const dishes = Object.values(carrito).map((item) => ({
      dish_id: item.id,
      quantity: item.cantidad,
    }));

    const data = {
      arrival_id: parseInt(arrivalId),
      station: "cocina",
      notes: "",
      dishes,
    };

    try {
      await axios.post("http://localhost:8000/orders/", data);
      setCarrito({});
      butterup.toast({
        title: "Orden Confirmada",
        message: "La orden fue enviada correctamente ✅",
        type: "success",
        dismissable: true,
      });
      cargarOrdenes();
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: error.response?.data?.detail || "Error al enviar la orden ❌",
        type: "error",
        dismissable: true,
      });
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:8000/arrivals/");
      setUsuarios(res.data);
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: "No se pudieron obtener los usuarios",
        type: "error",
        dismissable: true,
      });
    }
  };

  const cargarMenu = async () => {
    try {
      const res = await axios.get("http://localhost:8000/menu/available/");
      setMenu(res.data);
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: "No se pudo cargar el menú",
        type: "error",
        dismissable: true,
      });
    }
  };

  const cargarOrdenes = async () => {
    if (!arrivalId) return;
    try {
      const res = await axios.get(`http://localhost:8000/orders/${arrivalId}`);
      setOrdenes(res.data);
    } catch (error) {
      // Silencia el error si no hay órdenes
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
    <div className={`${COLORS.fondo} py-8 px-4 sm:px-10 rounded-3xl shadow-2xl border ${COLORS.borde} max-w-7xl mx-auto min-h-[80vh]`}>
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight mb-8 font-sans">
        Realizar orden de platillos
      </h1>

      {/* Selección de usuario */}
      <div className="max-w-md mx-auto mb-10">
        <label className="block mb-2 text-lg font-semibold text-[#264653] font-sans">
          Selecciona llegada (cliente):
        </label>
        <select
          className="block w-full px-5 py-3 rounded-xl border border-[#EADBC8] font-sans text-[#264653] bg-white shadow focus:ring-2 focus:ring-[#3BAEA0] focus:outline-none"
          value={arrivalId || ""}
          onChange={(e) => setArrivalId(e.target.value)}
        >
          <option value="">-- Selecciona una llegada --</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.customer_name || `Mesa ${u.id}`}
            </option>
          ))}
        </select>
      </div>

      {arrivalId && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menú */}
          <section className="flex-1">
            <h2 className="text-2xl font-bold mb-6 text-[#264653] font-sans">
              Menú disponible
            </h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {menu.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05, boxShadow: "0 8px 24px #3baea055" }}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-[#EADBC8] flex flex-col items-start transition"
                >
                  <p className="text-lg font-bold text-[#264653] font-sans mb-1">{item.name}</p>
                  <p className="text-[#3BAEA0] font-semibold mb-2">${item.price.toFixed(2)}</p>
                  <button
                    onClick={() =>
                      addItem({
                        id: item.id,
                        nombre: item.name,
                        precio: item.price,
                      })
                    }
                    className={`mt-2 w-full py-2 rounded-full font-bold text-white text-base shadow-md transition ${COLORS.boton}`}
                  >
                    + Agregar
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Carrito + Órdenes */}
          <aside className="w-full lg:w-[340px] flex flex-col gap-8">
            {/* Carrito */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#EADBC8]">
              <h2 className="text-xl font-bold text-[#8D2E38] font-sans mb-3">Carrito</h2>
              {Object.values(carrito).length === 0 ? (
                <p className="text-gray-400 font-sans">No hay ítems en el carrito.</p>
              ) : (
                <>
                  <ul className="flex-1 overflow-auto space-y-3">
                    {Object.values(carrito).map((it) => (
                      <li key={it.id} className="flex justify-between items-center border-b pb-2 font-sans">
                        <div>
                          <p className="text-[#264653] font-semibold">{it.nombre}</p>
                          <p className="text-[#3BAEA0] text-sm">
                            {it.cantidad} × ${it.precio.toFixed(2)} = ${(it.precio * it.cantidad).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => removeItem(it.id)}
                            className={`px-3 py-1 rounded-full text-white font-bold text-lg ${COLORS.botonRojo}`}
                          >
                            –
                          </button>
                          <button
                            onClick={() => addItem(it)}
                            className={`px-3 py-1 rounded-full text-white font-bold text-lg ${COLORS.boton}`}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[#264653] font-semibold">Total:</span>
                      <span className="text-[#8D2E38] font-extrabold text-lg">${total.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={confirmarOrden}
                      className={`w-full py-3 mt-2 rounded-full font-bold text-white text-base shadow-md transition ${COLORS.boton} ${COLORS.hoverAcento}`}
                    >
                      Confirmar Orden
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Órdenes enviadas */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#EADBC8]">
              <h3 className="text-xl font-bold text-[#8D2E38] font-sans mb-3">Órdenes enviadas</h3>
              <ul className="space-y-2 max-h-56 overflow-y-auto">
                {ordenes.length === 0 && (
                  <li className="text-gray-400 font-sans">No hay órdenes enviadas.</li>
                )}
                {ordenes.map((order) => (
                  <li key={order.id} className="border border-[#EADBC8] p-3 rounded-xl bg-[#FFF] flex flex-col">
                    <span className="text-sm text-[#264653] font-semibold">Orden #{order.id}</span>
                    <span className="text-xs text-[#3BAEA0]">Estado: {order.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Modal de confirmación */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <div className="absolute inset-0 pointer-events-none" />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border-2 border-[#3BAEA0] font-sans"
            >
              <h2 className="text-2xl font-bold mb-4 text-[#264653]">¿Confirmar esta orden?</h2>
              <ul className="mb-6 w-full text-left text-[#3BAEA0] text-base">
                {Object.values(carrito).map((it) => (
                  <li key={it.id}>
                    <b>{it.nombre}</b> × {it.cantidad} = ${(it.precio * it.cantidad).toFixed(2)}
                  </li>
                ))}
                <li className="mt-2 font-bold text-[#8D2E38]">
                  Total: ${total.toFixed(2)}
                </li>
              </ul>
              <div className="flex gap-4 w-full">
                <button
                  onClick={enviarOrden}
                  className="flex-1 py-2 rounded-full bg-[#3BAEA0] hover:bg-[#329b91] text-white font-semibold shadow transition"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-[#264653] font-semibold shadow transition"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
