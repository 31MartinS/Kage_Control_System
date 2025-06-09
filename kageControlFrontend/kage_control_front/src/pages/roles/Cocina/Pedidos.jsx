import { useEffect, useState } from "react";
import axios from "axios";
import butterup from "butteruptoasts";
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
      console.error("Error al cargar pedidos:", error);
      butterup.toast({
        title: "Error",
        message: "No se pudieron cargar los pedidos.",
        icon: "x",
        style: "error",
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
      console.error("Error al cargar detalles:", error);
      butterup.toast({
        title: "Error",
        message: "No se pudieron cargar los detalles del pedido.",
        icon: "x",
        style: "error",
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
    <div className="bg-[#FFF8F0] p-8 rounded-3xl shadow-xl border border-[#EADBC8] space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-bold text-[#8D2E38]">
        Pedidos — Todas las estaciones
      </h1>

      {loading ? (
        <p className="text-[#6B7280]">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-[#6B7280]">No hay pedidos en este momento.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="bg-white p-5 rounded-2xl border border-[#EADBC8] shadow flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="space-y-1">
                <p className="text-[#4D4D4D] font-semibold">
                  Mesa {o.table} — {o.time}
                </p>
                <p className="text-gray-500 text-sm">{o.items.join(", ")}</p>
              </div>
              <button
                onClick={() => cargarDetalles(o.id)}
                className="mt-3 sm:mt-0 px-5 py-2 bg-[#3BBAC9] hover:bg-[#22A1BB] text-white rounded-full font-medium shadow transition duration-300"
              >
                Ver detalle
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal mejorado */}
      {showModal && (
        <>
          {/* Fondo overlay */}
          <div className="fixed   backdrop-blur-sm z-40" onClick={() => setShowModal(false)}></div>

          {/* Modal container */}
          <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-8 relative font-sans text-gray-800">
              {/* Botón cerrar */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 transition duration-200 text-3xl font-bold"
                aria-label="Cerrar modal"
              >
                &times;
              </button>

              <h2 className="text-3xl font-semibold mb-6 border-b pb-3 border-gray-200">
                Detalles del pedido #{selectedOrderId}
              </h2>

              {detailsLoading ? (
                <p className="text-center text-gray-500">Cargando detalles...</p>
              ) : (
                <>
                  <section className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Notas</h3>
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
                    <h3 className="text-xl font-semibold mb-2">Items en la orden</h3>
                    {selectedOrder ? (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
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
            </div>
          </div>
        </>
      )}
    </div>
  );
}
