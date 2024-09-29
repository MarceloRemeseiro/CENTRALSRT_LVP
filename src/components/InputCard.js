import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import VideoPlayer from "./VideoPlayer";
import OutputDefault from "./OutputDefault";
import CustomOutputs from "./CustomOutputs";
import InputInfo from "./InputInfo";
import InputData from "./InputData";
import Link from "next/link";

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
  const [videoRefreshTrigger, setVideoRefreshTrigger] = useState(0);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchInputStatus = async () => {
      try {
        const response = await fetch(`/api/process/${input.id}/state`);
        const data = await response.json();
        setLocalInput((prevInput) => {
          if (prevInput.state !== data.state) {
            if (data.state === "running") {
              // Configurar un timeout para refrescar el video después de 3 segundos
              if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
              }
              refreshTimeoutRef.current = setTimeout(() => {
                setVideoRefreshTrigger(prev => prev + 1);
              }, 3000);
            }
            return { ...prevInput, state: data.state };
          }
          return prevInput;
        });
      } catch (error) {
        console.error("Error fetching input status:", error);
      }
    };

    const intervalId = setInterval(fetchInputStatus, 5000);
    return () => {
      clearInterval(intervalId);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [input.id]);

  useEffect(() => {
    setLocalOutputs(input.customOutputs);
  }, [input.customOutputs]);

  const fetchOutputState = async (outputId) => {
    try {
      const response = await fetch(`/api/process/${outputId}/state`);
      const data = await response.json();
      return data.state;
    } catch (error) {
      console.error("Error al obtener el estado del output:", error);
      return "unknown";
    }
  };

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
    // Corregir el ID si está duplicado
    const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
    console.log("ID corregido para eliminar:", correctedOutputId);

    try {
      await eliminarPuntoPublicacion(input.id, correctedOutputId);
      setLocalOutputs(prevOutputs => prevOutputs.filter(output => output.id !== outputId));
    } catch (error) {
      console.error("Error al eliminar el punto de publicación:", error);
      alert("Error al eliminar el punto de publicación. Por favor, inténtelo de nuevo.");
    }
  };

  const handleToggle = async (outputId, currentState, index) => {
    console.log("handleToggle llamado con outputId:", outputId, "currentState:", currentState, "index:", index);
    if (currentState === "running") {
      setConfirmationModal({
        isOpen: true,
        message: "¿Seguro quieres apagar el Punto de publicación?",
        onConfirm: () => performToggle(outputId, currentState, index),
      });
    } else {
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

      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      console.log("ID corregido:", correctedOutputId);

      const updatedOutput = await toggleOutputState(correctedOutputId, newState);

      console.log("Estado actualizado recibido:", updatedOutput.state);

      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, state: updatedOutput.state, isTogglingOn: undefined }
            : output
        )
      );

      // Forzar una actualización del estado después de un breve retraso
      setTimeout(async () => {
        const refreshedState = await fetchOutputState(correctedOutputId);
        setLocalOutputs((prevOutputs) =>
          prevOutputs.map((output, i) =>
            i === index
              ? { ...output, state: refreshedState }
              : output
          )
        );
      }, 2000);

    } catch (error) {
      console.error("Error al cambiar el estado del output:", error);
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, isTogglingOn: undefined } : output
        )
      );
    }
  };

  const getStatusIcon = (state) => {
    return state === "running" ? "🟢" : "🔴";
  };

  return (
    <div className="bg-gray-800 text-gray-200 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center">
        <Link href={`input/${input.id}`}>
          <h2 className="text-xl font-bold mb-2 text-white">
            SRT INPUT # {index + 1}
          </h2>
        </Link>
        <span className="text-2xl mb-2">{getStatusIcon(localInput.state)}</span>
      </div>
      <InputData input={input} />
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
        <VideoPlayer
          url={localInput.defaultOutputs.HLS}
          isRunning={localInput.state === "running"}
          refreshTrigger={videoRefreshTrigger}
        />
      </div>
      <InputInfo name={input.name} streamId={input.streamId} />
      <OutputDefault defaultOutputs={input.defaultOutputs} />
      <CustomOutputs
        localOutputs={localOutputs}
        handleEliminarPunto={handleEliminarPunto}
        handleToggle={handleToggle}
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={openModal}
          className="flex justify-center mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Agregar Punto de Publicación RTMP
        </button>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">RTMP</h2>
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