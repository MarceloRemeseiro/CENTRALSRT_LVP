"use client";
import IframePlayer from "../components/IframePlayer";
import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import ConfirmationModal from "../components/ConfirmationModal";
import VideoPlayer from "../components/VideoPlayer";


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
  toggleOutputState,
}) => {
  const [localInput, setLocalInput] = useState(input);
  const [localOutputs, setLocalOutputs] = useState(input.customOutputs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    const fetchInputStatus = async () => {
      try {
        const response = await fetch(`/api/process/${input.id}/state`);
        const data = await response.json();
        setLocalInput((prevInput) => ({ ...prevInput, state: data.state }));
      } catch (error) {
        console.error("Error fetching input status:", error);
      }
    };

    const intervalId = setInterval(fetchInputStatus, 5000);
    return () => clearInterval(intervalId);
  }, [input.id]);

  const getStatusIcon = (state) => {
    return state === "running" ? "🟢" : "🔴";
  };

  useEffect(() => {
    setLocalOutputs(input.customOutputs);
  }, [input.customOutputs]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleAgregarPunto = async (e) => {
    e.preventDefault();
    const nuevoOutput = await agregarPuntoPublicacion(input.id, {
      nombre,
      url,
      streamKey: key,
    });
    if (nuevoOutput) {
      setLocalOutputs([...localOutputs, nuevoOutput]);
    }
    setNombre("");
    setUrl("");
    setKey("");
    closeModal();
  };

  const handleEliminarPunto = (outputId) => {
    setConfirmationModal({
      isOpen: true,
      message: "¿Seguro quieres eliminar este Punto de publicación?",
      onConfirm: () => performEliminarPunto(outputId),
    });
  };

  const performEliminarPunto = async (outputId) => {
    await eliminarPuntoPublicacion(input.id, outputId);
    setLocalOutputs(localOutputs.filter((output) => output.id !== outputId));
  };

  const handleToggle = async (outputId, currentState, index) => {
    if (currentState === "running") {
      // Si está encendido, mostrar confirmación antes de apagar
      setConfirmationModal({
        isOpen: true,
        message: "¿Seguro quieres apagar el Punto de publicación?",
        onConfirm: () => performToggle(outputId, currentState, index),
      });
    } else {
      // Si está apagado, encender directamente sin confirmación
      performToggle(outputId, currentState, index);
    }
  };

  const performToggle = async (outputId, currentState, index) => {
    const newState = currentState === "running" ? "stop" : "start";

    try {
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, isTogglingOn: newState === "start" }
            : output
        )
      );

      const updatedOutput = await toggleOutputState(outputId, newState);

      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, state: updatedOutput.state, isTogglingOn: undefined }
            : output
        )
      );
    } catch (error) {
      console.error("Error al cambiar el estado del output:", error);
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, isTogglingOn: undefined } : output
        )
      );
    }
  };

  // Aquí definimos el estilo para el switch
  const getSwitchColor = (output) => {
    if (output.state === "failed") return "bg-red-500";
    if (output.isTogglingOn) return "bg-gray-300";
    return output.state === "running" ? "bg-green-500" : "bg-gray-300";
  };

  const switchStyle = (output) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition ${getSwitchColor(
      output
    )}`;

  const circleStyle = (output) =>
    `inline-block h-4 w-4 rounded-full bg-white transition transform ${
      output.state === "running" || output.isTogglingOn
        ? "translate-x-6"
        : "translate-x-1"
    }`;

  return (
    <div className="bg-gray-800 text-gray-200 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-2 text-white">
          SRT INPUT # {index + 1}
        </h2>
        <span className="text-2xl mb-2">{getStatusIcon(localInput.state)}</span>
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
            <div className="flex items-center justify-between ">
              <p className="text-sm text-gray-300 break-all">
                {`${input.streamId}.stream,mode:publish`}
              </p>
              <CopyButton text={`${input.streamId}.stream,mode:publish`} />
            </div>
          </div>
        </div>
      </div>

      {/* <div className="mb-2">
        <IframePlayer
          url={localInput.defaultOutputs.HTML}
          isRunning={localInput.state === "running"}
        />
      </div> */}
      <div className="mb-2">
        <VideoPlayer 
          url={localInput.defaultOutputs.HLS} 
          isRunning={localInput.state === "running"}
        />
      </div>
      <div className="px-3">
        <p>
          <strong className="text-gray-400">Nombre:</strong> {input.name}
        </p>
        <p>
          <strong className="text-gray-400">Stream ID:</strong>
        </p>
        <div className="flex items-center justify-between">
          <p>{input.streamId}</p>
          <CopyButton text={input.streamId} />
        </div>
      </div>
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
              <div key={output.id} className="bg-gray-700 p-3 rounded">
                <div className="flex justify-between items-center">
                  <p>
                    <strong className="text-gray-300">Nombre:</strong>{" "}
                    {output.name}
                  </p>
                  <div
                    className={switchStyle(output)}
                    onClick={() => handleToggle(output.id, output.state, index)}
                  >
                    <span className={circleStyle(output)} />
                  </div>
                </div>
                <p className="text-sm break-all text-gray-400">
                  {output.address}
                </p>
                <button
                  onClick={() => handleEliminarPunto(output.id)}
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
              className="flex justify-center px-4 py-2 bg-blue-600 text-white text-xl font-extrabold rounded hover:bg-blue-700 transition-colors"
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
      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        onConfirm={() => {
          confirmationModal.onConfirm();
          setConfirmationModal({ ...confirmationModal, isOpen: false });
        }}
        message={confirmationModal.message}
      />
    </div>
  );
};

export default InputCard;
