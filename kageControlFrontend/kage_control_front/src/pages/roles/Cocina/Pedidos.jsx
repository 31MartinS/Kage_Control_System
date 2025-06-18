import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";

export default function Pedidos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/orders/tracking");
      setOrders(res.data);
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: "No se pudieron cargar los pedidos.",
        type: "error",
        dismissable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalles = async (orderId) => {
    setDetailsLoading(true);
    setSelectedOrderId(orderId);
    try {
      const res = await axios.get(`http://localhost:8000/orders/${orderId}`);
      setOrderDetails(res.data);
      setShowModal(true);
    } catch (error) {
      butterup.toast({
        title: "Error",
        message: "No se pudieron cargar los detalles del pedido.",
        type: "error",
        dismissable: true,
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <div className="bg-[#FFF8F0] p-8 sm:p-12 rounded-3xl shadow-2xl border-2 border-[#EADBC8] max-w-4xl mx-auto min-h-[70vh] space-y-8 font-sans">
      <h1 className="text-4xl font-extrabold text-center text-[#3BAEA0] tracking-tight">
        Pedidos — Todas las estaciones
      </h1>

      {loading ? (
        <p className="text-[#6B7280] text-center text-lg font-sans">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-[#6B7280] text-center text-lg font-sans">No hay pedidos en este momento.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((o) => (
            <motion.li
              key={o.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border-2 border-[#EADBC8] shadow-lg flex flex-col sm:flex-row sm:justify-between sm:items-center transition hover:shadow-2xl"
            >
              <div className="space-y-1">
                <p className="text-[#264653] font-bold text-lg">
                  Mesa {o.table} — <span className="text-[#3BAEA0] font-semibold">{o.time}</span>
                </p>
                <p className="text-gray-500 text-base">{o.items.join(", ")}</p>
              </div>
              <button
                onClick={() => cargarDetalles(o.id)}
                className="mt-4 sm:mt-0 px-6 py-2 rounded-full font-bold text-white text-base bg-[#3BAEA0] hover:bg-[#22A1BB] shadow transition-all duration-300"
              >
                Ver detalle
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {/* Modal elegante */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "rgba(0,0,0,0)" }}
          >
            <div className="absolute inset-0 pointer-events-auto" onClick={() => setShowModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl p-8 border-2 border-[#3BAEA0] font-sans"
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-6 text-[#3BAEA0] hover:text-[#264653] transition text-3xl font-bold"
                aria-label="Cerrar modal"
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center text-[#264653] border-b pb-3 border-[#EADBC8]">
                Detalles del pedido #{selectedOrderId}
              </h2>

              {detailsLoading ? (
                <p className="text-center text-gray-500">Cargando detalles...</p>
              ) : (
                <>
                  <section className="mb-8">
                    <h3 className="text-lg font-semibold mb-2 text-[#3BAEA0]">Notas</h3>
                    {orderDetails.length === 0 ? (
                      <p className="text-gray-600 italic">Sin notas.</p>
                    ) : (
                      orderDetails.map((detail, idx) => (
                        <p key={idx} className="mb-1 px-4 py-2 bg-[#FFF8F0] rounded-lg border border-[#EADBC8]">
                          {detail.notes || "Sin notas"}
                        </p>
                      ))
                    )}
                  </section>
                  <section>
                    <h3 className="text-lg font-semibold mb-2 text-[#3BAEA0]">Items en la orden</h3>
                    {selectedOrder ? (
                      <ul className="list-disc list-inside space-y-2 text-[#264653]">
                        {selectedOrder.items.map((item, i) => (
                          <li key={i} className="px-3 py-1 bg-[#F3F4F6] rounded-md">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 italic">No se encontraron items.</p>
                    )}
                  </section>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
