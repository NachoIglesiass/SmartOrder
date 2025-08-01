"use client";
import React, { useEffect, useState } from "react";
import api from "@/utils/api"; // ✅ Usamos api centralizado

const normalizarEstado = (estado) =>
  estado?.toLowerCase().replace("í", "i").replace("ó", "o");

const calcularEstadoVisual = (items) => {
  const estados = items.map(item => normalizarEstado(item.status));
  if (estados.length && estados.every(st => st === "pendiente")) return "pendiente";
  if (estados.length && estados.every(st => st === "en preparacion" || st === "en preparación")) return "en preparación";
  if (estados.length && estados.every(st => st === "listo" || st === "en mesa")) return "listo";
  if (estados.includes("pendiente")) return "pendiente";
  if (estados.includes("en preparacion") || estados.includes("en preparación")) return "en preparación";
  return "listo";
};

const estadoPedidoColor = (estado) => {
  switch (estado) {
    case "pendiente": return "border-l-8 border-orange-500";
    case "en preparación":
    case "en preparacion": return "border-l-8 border-blue-700";
    case "listo": return "border-l-8 border-green-600";
    default: return "border-l-8 border-gray-600";
  }
};

export default function CocinaPage() {
  const [verificandoRol, setVerificandoRol] = useState(true);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token || (role !== "kitchen" && role !== "admin")) {
      window.location.href = "/unauthorized";
    } else {
      setVerificandoRol(false);
    }
  }, []);

  const fetchPedidos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/orders/sector/cocina", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pedidosFormateados = response.data.map((pedido) => ({
        id: pedido._id,
        mesa: pedido.mesa?.nombre || "Desconocida",
        mozo: pedido.user?.username || "Mozo desconocido",
        hora: new Date(pedido.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        notas: pedido.notes || "",
        items: pedido.items,
        status: pedido.status,
      }));
      setPedidos(pedidosFormateados);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    }
  };

  const cambiarEstado = async (pedidoId, itemId, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(
        `/orders/${pedidoId}/item/${itemId}/status`,
        { status: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPedidos();
    } catch (error) {
      console.error("Error al cambiar estado del item:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  if (verificandoRol) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    const orden = {
      "pendiente": 0,
      "en preparación": 1,
      "en preparacion": 1,
      "listo": 2,
    };
    const estadoA = calcularEstadoVisual(a.items);
    const estadoB = calcularEstadoVisual(b.items);
    return (orden[estadoA] ?? 9) - (orden[estadoB] ?? 9);
  });

  const GRID_ROWS = 2;
  const GRID_COLS = 3;
  const BLOQUE_W = 600;
  const BLOQUE_H = 440;

  const pedidosAMostrar = pedidosOrdenados.slice(0, GRID_ROWS * GRID_COLS);

  return (
    <main className="min-h-screen bg-[#18181c] p-8 relative overflow-hidden">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded shadow"
        title="Cerrar sesión"
      >
        Cerrar sesión
      </button>
      <h1 className="text-white text-2xl font-semibold mb-6">Panel de Cocina</h1>

      <div
        className="w-full mx-auto"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, ${BLOQUE_W}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${BLOQUE_H}px)`,
          gap: "32px",
          justifyContent: "center",
          alignItems: "center",
          height: GRID_ROWS * BLOQUE_H + (GRID_ROWS - 1) * 32
        }}
      >
        {pedidosAMostrar.length === 0 && (
          <div className="col-span-full text-gray-400 text-center">
            No hay productos pendientes de cocina.
          </div>
        )}

        {pedidosAMostrar.map((pedido, idx) => {
          const estadoVisual = calcularEstadoVisual(pedido.items);

          return (
            <div
              key={pedido.id}
              className={`relative flex flex-col shadow-xl rounded-2xl bg-[#23232d] p-0 overflow-hidden ${estadoPedidoColor(estadoVisual)}`}
              style={{ width: BLOQUE_W, height: BLOQUE_H }}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start px-7 pt-5 pb-1">
                <div>
                  <div className="text-white text-md font-bold">
                    Pedido #{pedido.id.toString().slice(-4).padStart(4, "0")}
                  </div>
                  <div className="text-xl font-bold text-white">{pedido.mesa}</div>
                  <div className="flex items-center gap-2 text-white font-medium text-base mt-1">
                    <span className="text-lg">👤</span>
                    <span>{pedido.mozo}</span>
                  </div>
                  {pedido.notas && (
                    <div className="flex items-center gap-2 text-sm text-[#ff8888] mt-1">
                      <span className="text-lg">📄</span>
                      <span className="font-medium">{pedido.notas}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-300 font-mono">{pedido.hora}</span>
                  <span
                    className={`text-base font-bold px-4 py-1 rounded-lg text-white`}
                    style={{
                      background:
                        estadoVisual === "pendiente"
                          ? "#ff8800"
                          : estadoVisual === "en preparación" || estadoVisual === "en preparacion"
                          ? "#2563eb"
                          : estadoVisual === "listo"
                          ? "#22c55e"
                          : "#444"
                    }}
                  >
                    {estadoVisual.toUpperCase()}
                  </span>
                </div>
              </div>
              {/* Productos en GRID dentro del bloque */}
              <div className="flex-1 w-full px-7 pb-5 pt-2 overflow-hidden">
                <div
                  className="grid gap-3"
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    gridAutoRows: "minmax(60px, 1fr)",
                  }}
                >
                  {pedido.items.map((item, i) => (
                    <div
                      key={item._id || i}
                      className="bg-[#32323c] rounded-lg p-2 flex flex-col gap-1 shadow border border-[#343444] min-w-0"
                    >
                      <div className="text-white text-base font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.quantity}x {item.product?.name}
                      </div>
                      <select
                        value={item.status}
                        onChange={e => {
                          const value = e.target.value;
                          // Si pasa a "listo", pedir confirmación
                          if (value === "listo") {
                            const confirmar = window.confirm("¿Confirmás que este producto está listo?");
                            if (!confirmar) return;
                          }
                          cambiarEstado(pedido.id, item._id, value);
                        }}
                        className="bg-[#22222a] border border-[#454559] rounded px-2 py-1 text-white font-semibold text-sm"
                        style={{ width: "100%" }}
                      >
                        <option value="pendiente">🕓 Pendiente</option>
                        <option value="en preparación">🍳 En Preparación</option>
                        <option value="listo">✅ Listo</option>
                      </select>
                      {item.agregado && (
                        <span className="text-xs text-yellow-400 italic">(Agregado después)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
