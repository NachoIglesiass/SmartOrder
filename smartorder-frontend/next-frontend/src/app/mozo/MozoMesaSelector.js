import { useState, useEffect } from "react";
import api from "@/utils/api";

export default function MozoMesaSelector({
  mesas,
  mesaSeleccionada,
  setMesaSeleccionada,
  onNext,
  setPedidoActual,
  refreshKey,
}) {
  const [ocupadas, setOcupadas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    api
      .get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const ocupadasIds = res.data
          .filter((order) =>
            [
              "pendiente",
              "en preparación",
              "listo",
              "en mesa",
              "a cobrar",
              "pagado"
            ].includes(order.status)
          )
          .map((order) => order.mesa?._id || order.mesa);
        setOcupadas(ocupadasIds);
      });
  }, [refreshKey]);

  const handleSelect = (mesa) => {
    setMensaje("");
    if (ocupadas.includes(mesa._id)) {
      setMensaje(
        "Esta mesa ya tiene un pedido abierto. Podés sumar productos al pedido existente."
      );
      setMesaSeleccionada(mesa._id);
      setPedidoActual(true);
    } else {
      setMesaSeleccionada(mesa._id);
      setPedidoActual(false);
    }
  };

  const mesasOrdenadas = [...mesas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, undefined, { numeric: true })
  );

  return (
    <div className="animate-fadein flex flex-col w-full h-screen px-6 pb-6 font-[Montserrat,Inter,sans-serif] bg-[#18181c] rounded-3xl shadow-lg box-border">
      <div className="flex items-center gap-2 py-4 mb-4">
        <h3 className="text-3xl font-extrabold flex-1 text-center tracking-wide text-white drop-shadow-md">
          Seleccionar Mesa
        </h3>
      </div>

      {mensaje && (
        <div className="mb-3 text-yellow-400 text-center font-semibold">{mensaje}</div>
      )}

      <div className="flex-1 overflow-y-auto scroll-fina space-y-6">
        <section className="bg-[#23232d]/90 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <h4 className="font-bold text-blue-400 text-xl mb-5 tracking-wide uppercase border-l-4 border-blue-600/70 pl-4 drop-shadow">
            Mesas
          </h4>

          <div className="flex flex-row flex-wrap gap-4 justify-center">
            {mesasOrdenadas.length === 0 ? (
              <p className="text-gray-500 italic text-center w-full">No hay mesas</p>
            ) : (
              mesasOrdenadas.map((mesa) => {
                const isOcupada = ocupadas.includes(mesa._id);
                const isSeleccionada = mesaSeleccionada === mesa._id;
                return (
                  <button
                    key={mesa._id}
                    type="button"
                    aria-label={`Mesa ${mesa.nombre}`}
                    onClick={() => handleSelect(mesa)}
                    aria-pressed={isSeleccionada}
                    className={`mesa-btn-anim px-8 py-5 rounded-3xl border-2 text-lg font-bold shadow-lg transition-all duration-300 focus:outline-none select-none focus-visible:ring-4 focus-visible:ring-blue-400/70 active:scale-95
                      ${
                        isOcupada && isSeleccionada
                          ? "bg-yellow-500/90 text-yellow-900 border-yellow-400 scale-105 ring-2 ring-yellow-300"
                          : isOcupada
                          ? "bg-yellow-500/90 text-yellow-900 border-yellow-600"
                          : isSeleccionada
                          ? "bg-gradient-to-r from-blue-700 to-blue-400 text-white border-blue-300 scale-105 shadow-blue-600/50 ring-2 ring-blue-300"
                          : "bg-[#23232d]/90 text-blue-400 border-blue-700 hover:bg-blue-900/90 hover:text-white hover:shadow-blue-700/50"
                      }
                    `}
                  >
                    {mesa.nombre}
                    {isOcupada && (
                      <span className="ml-2 text-xs font-bold text-yellow-900">
                        (Ocupada)
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      <button
        className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 rounded-3xl w-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide transition"
        disabled={!mesaSeleccionada}
        onClick={onNext}
        type="button"
      >
        {ocupadas.includes(mesaSeleccionada)
          ? "Gestionar Pedido Existente"
          : "Confirmar Mesa"}
      </button>
    </div>
  );
}
