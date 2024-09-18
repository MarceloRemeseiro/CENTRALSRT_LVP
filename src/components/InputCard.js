"use client";
import IframePlayer from "../components/IframePlayer";
import { useState } from "react";
import Modal from "../components/Modal";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar el texto: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
};

const InputCard = ({
  input,
  index,
  agregarPuntoPublicacion,
  eliminarPuntoPublicacion,
  toggleOutputState, // Función para alternar el estado del output
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAgregarPunto = (e) => {
    e.preventDefault();
    agregarPuntoPublicacion(input.id, { nombre, url, streamKey: key });
    setNombre("");
    setUrl("");
    setKey("");
    closeModal();
  };

  const getStatusIcon = (state) => {
    return state === "running" ? "🟢" : "🔴";
  };

  // Aquí definimos el estilo para el switch
  const switchStyle = (isOn) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition ${
      isOn ? "bg-green-500" : "bg-gray-300"
    }`;

  const circleStyle = (isOn) =>
    `inline-block h-4 w-4 rounded-full bg-white transition transform ${
      isOn ? "translate-x-6" : "translate-x-1"
    }`;

  // Definimos un estado local para manejar el estado de cada output
  const [localOutputs, setLocalOutputs] = useState(
    input.customOutputs.map((output) => ({
      ...output,
      isRunning: output.state === "running", // Usamos el estado inicial de cada output
    }))
  );

  const handleToggle = async (outputId, currentExecState, index) => {
    console.log("Estado actual antes del toggle:", currentExecState);
    console.log("Output ID:", outputId);

    // Determinamos si el estado debe cambiar a "start" o "stop" basándonos en el estado actual
    let newState;
    if (currentExecState === "running") {
      newState = "stop"; // Si está en ejecución, lo apagamos
    } else {
      newState = "start"; // Si no está en ejecución, lo encendemos
    }

    console.log("Nuevo estado que se enviará:", newState);

    try {
      // Cambiamos el estado local primero para reflejar la acción del usuario
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, isRunning: newState === "start" } : output
        )
      );

      // Enviamos la solicitud al servidor para cambiar el estado
      await toggleOutputState(outputId, newState);

      // Refrescamos el estado local tras la respuesta del servidor
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, state: newState } : output
        )
      );

      console.log("Estado después del toggle:", newState);
    } catch (error) {
      console.error("Error al cambiar el estado del output:", error);
      // En caso de error, revertimos el estado local
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, isRunning: !output.isRunning } : output
        )
      );
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-2 text-white">
          SRT INPUT # {index + 1}
        </h2>
        <span className="text-2xl mb-2">{getStatusIcon(input.state)}</span>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 font-semibold">URL</p>
            <p className="text-sm text-gray-300 break-all">
              srt://lvp.streamingpro.es
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">PORT</p>
            <p className="text-sm text-gray-300">6001</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">LATENCY</p>
            <p className="text-sm text-gray-300">120ms</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">TIPO</p>
            <p className="text-sm text-gray-300">CALLER</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 font-semibold">STREAMID</p>
            <p className="text-sm text-gray-300 break-all">
              {`${input.streamId}.stream,mode:publish`}
              <CopyButton text={`${input.streamId}.stream,mode:publish`} />
            </p>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <IframePlayer url={input.defaultOutputs.HTML} />
      </div>
      <p>
        <strong className="text-gray-400">Nombre:</strong> {input.name}
      </p>
      {/* <p>
        <strong className="text-gray-400">Descripción:</strong>{" "}
        {input.description}
      </p> */}
      <p>
        <strong className="text-gray-400">Stream ID:</strong> {input.streamId}{" "}
        <CopyButton text={input.streamId} />
      </p>
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        OUTPUTS POR DEFECTO
      </h3>
      <div className="bg-gray-700 p-3 rounded mb-4">
        {Object.entries(input.defaultOutputs).map(([key, value]) => (
          <div key={key} className="mb-2 flex items-center justify-between">
            <div>
              <p>
                <strong className="text-gray-300">{key}:</strong>
              </p>
              <p className="text-sm break-all text-gray-400">{value}</p>
            </div>
            <CopyButton text={value} />
          </div>
        ))}
      </div>
      <div></div>

      {localOutputs && localOutputs.length > 0 ? (
        <>
          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            PUNTOS DE PUBLICACIÓN
          </h3>
          <div className="space-y-2">
            {localOutputs.map((output, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded">
                <div className="flex justify-between items-center">
                  <p>
                    <strong className="text-gray-300">Nombre:</strong>{" "}
                    {output.name}
                  </p>
                  {/* Interruptor para encender/apagar el output */}
                  <div
                    className={switchStyle(output.isRunning)}
                    onClick={() => {
                      console.log(
                        "Output State antes del toggle:",
                        output.state
                      ); // Comprobamos el estado actual
                      handleToggle(output.id, output.state, index);
                    }}
                  >
                    <span className={circleStyle(output.isRunning)} />
                  </div>
                </div>
                <p className="text-sm break-all text-gray-400">
                  {output.address}
                </p>
                <button
                  onClick={() => eliminarPuntoPublicacion(input.id, output.id)}
                  className="mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
          {/* Botón para agregar más puntos de publicación debajo de los existentes */}
          <div className="flex justify-center mt-4">
            <button
              onClick={openModal}
              className="flex justify-center p-2 bg-blue-600 text-white text-xl font-extrabold rounded hover:bg-blue-700 transition-colors"
            >
              +
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Agregar Punto de Publicación
          </button>
        </div>
      )}

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">
            Agregar Punto de Publicación RTMP
          </h2>
          <form onSubmit={handleAgregarPunto} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa un nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-400">URL</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-400">Key</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Agregar
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InputCard;
