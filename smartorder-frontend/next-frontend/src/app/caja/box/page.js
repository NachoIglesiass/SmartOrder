"use client";
import React, { useState, useEffect } from "react";
import api from "@/utils/api"; // ✅ Cambio aquí

const badgeColor = (estado) => {
  switch (estado) {
    case "a cobrar": return "bg-blue-800 text-blue-100";
    case "pagado": return "bg-green-800 text-green-100";
    case "cerrado": return "bg-red-600 text-red-100";
    default: return "bg-gray-600 text-white";
  }
};

export default function CajaBoxPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesaBuscada, setMesaBuscada] = useState("");
  const [mozoSeleccionado, setMozoSeleccionado] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });

      let pedidosFiltrados = response.data.filter(
        (pedido) =>
          pedido.status === "a cobrar" ||
          pedido.status === "pagado" ||
          pedido.status === "cerrado"
      );

      pedidosFiltrados = pedidosFiltrados.sort((a, b) => {
        const orden = { "a cobrar": 1, "pagado": 2, "cerrado": 3 };
        return (orden[a.status] || 4) - (orden[b.status] || 4);
      });

      const pedidosAdaptados = pedidosFiltrados.map((pedido) => ({
        id: pedido._id,
        mesa: pedido.mesa,
        mozo: pedido.user?.username || "Mozo desconocido",
        estado: pedido.status,
        hora: new Date(pedido.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notas: pedido.notes || "",
        detalle: pedido.items.map((item) => ({
          nombre: item.product?.name || "Producto",
          cantidad: item.quantity,
          precio: item.product?.price || 0,
          total: item.quantity * (item.product?.price || 0)
        }))
      }));

      setPedidos(pedidosAdaptados);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const marcarComoPagado = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/orders/${id}/status`,
        { status: "pagado" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: "pagado" } : p))
      );
      setModalVisible(false);
      setPedidoSeleccionado(null);
    } catch (error) {
      console.error("Error al marcar como pagado:", error);
      alert("No se pudo actualizar el estado");
    }
  };

  const deshacerPago = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/orders/${id}/status`,
        { status: "a cobrar" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: "a cobrar" } : p))
      );
      alert("Pago deshecho correctamente");
    } catch (error) {
      console.error("Error al deshacer pago:", error);
      alert("No se pudo deshacer el pago");
    }
  };

  const mozosUnicos = [...new Set(pedidos.map((p) => p.mozo))];

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const mesaCoincide =
      mesaBuscada === "" || pedido.mesa?.nombre?.toLowerCase().includes(mesaBuscada.toLowerCase());
    const mozoCoincide =
      mozoSeleccionado === "" || pedido.mozo === mozoSeleccionado;
    return mesaCoincide && mozoCoincide;
  });

  if (loading) return <p className="text-white">Cargando pedidos...</p>;
  
  return (
    <>
      <div className="flex flex-row gap-6 w-full">
        {/* Columna izquierda: pedidos */}
        <div className="flex-1 space-y-6">
          {pedidosFiltrados.map((pedido) => {
            const total = pedido.detalle.reduce((acc, item) => acc + item.total, 0);
            return (
              <div
                key={pedido.id}
                className="bg-[#1b1b1e] text-white border border-[#2d2d30] rounded-xl p-6 shadow-xl w-full"
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm text-blue-400 font-semibold">
                    Pedido: #{pedido.id.toString().slice(-4).padStart(4, "0")}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeColor(pedido.estado)}`}>
                      {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                    </span>
                    <span className="text-xs text-gray-400">{pedido.hora}</span>
                  </div>
                </div>

                <div className="mt-2 mb-2">
                  <span className="inline-block text-white bg-blue-600 rounded-full px-4 py-1 text-sm font-semibold">
                    {pedido.mesa.nombre}
                  </span>
                </div>

                <div className="text-sm text-gray-300 flex items-center gap-2 mb-1">
                  <span>👤</span>
                  <span className="font-medium">Mozo: {pedido.mozo}</span>
                </div>

                <div className="text-sm text-[#ff6666] flex gap-2 mb-2">
                  <span>📄</span>
                  <span className="italic">{pedido.notas}</span>
                </div>

                <div className="bg-[#2b2b2f] rounded-lg p-4 text-sm border border-[#3a3a3f] shadow-inner">
                  <div className="mb-2 text-gray-300 font-bold">Detalle del Pedido:</div>
                  <div className="space-y-2">
                    {pedido.detalle.map((item, i) => (
                      <div key={i} className="flex justify-between text-gray-200">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span className="flex gap-6 font-mono text-right">
                          <span>${item.precio.toLocaleString()}</span>
                          <span>${item.total.toLocaleString()}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-between font-bold text-green-400 text-lg border-t border-gray-600 pt-2">
                    <span>TOTAL:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* BOTONES según estado */}
                {pedido.estado === "a cobrar" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setModalVisible(true);
                      }}
                      className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow"
                    >
                      ✔ Cobrar
                    </button>
                  </div>
                )}

                {pedido.estado === "pagado" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => deshacerPago(pedido.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow"
                    >
                      Deshacer Pago
                    </button>
                  </div>
                )}

                {/* Si está cerrado, no muestra ningún botón */}

              </div>
            );
          })}
        </div>

        {/* Columna derecha: filtros */}
        <div className="w-full max-w-xs bg-[#1f1f25] p-6 rounded-xl border border-[#2d2d30] shadow-xl text-white space-y-6 h-fit self-start">
          <h2 className="text-lg font-bold mb-2">🔎 Buscar Pedido</h2>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Buscar por mesa:</label>
            <input
              type="text"
              value={mesaBuscada}
              onChange={(e) => setMesaBuscada(e.target.value)}
              className="w-full p-2 bg-[#2c2c34] rounded border border-[#3a3a3f] text-white focus:outline-none"
              placeholder="Ej: 5"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Filtrar por mozo:</label>
            <select
              value={mozoSeleccionado}
              onChange={(e) => setMozoSeleccionado(e.target.value)}
              className="w-full p-2 bg-[#2c2c34] rounded border border-[#3a3a3f] text-white focus:outline-none"
            >
              <option value="">Todos los mozos</option>
              {mozosUnicos.map((mozo) => (
                <option key={mozo} value={mozo}>
                  {mozo}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modal confirmación */}
      {modalVisible && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1b1b1e] rounded-xl p-6 w-80 shadow-lg text-white">
            <h3 className="text-xl font-bold mb-4">Confirmar pago</h3>
            <p className="mb-6">
              ¿Confirmás que querés marcar el pedido #{pedidoSeleccionado.id.toString().slice(-4).padStart(4, "0")} como pagado?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                onClick={() => {
                  setModalVisible(false);
                  setPedidoSeleccionado(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg"
                onClick={() => marcarComoPagado(pedidoSeleccionado.id)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
