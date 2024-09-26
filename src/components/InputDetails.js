"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import InputInfo from "./InputInfo";
import OutputDefault from "./OutputDefault";
import CustomOutputs from "./CustomOutputs";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import InputData from "./InputData";
import Link from "next/link";

const InputDetails = ({
  input,
  agregarPuntoPublicacion,
  eliminarPuntoPublicacion,
  toggleOutputState,
}) => {
  const [localInput, setLocalInput] = useState(input);
  const [localOutputs, setLocalOutputs] = useState(input.customOutputs || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoRefreshTrigger, setVideoRefreshTrigger] = useState(0);
  const [newOutput, setNewOutput] = useState({
    nombre: "",
    url: "",
    streamKey: "",
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });
  const refreshTimeoutRef = useRef(null);

  const fetchInputStatus = useCallback(async () => {
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
          return { ...prevInput, ...data };
        }
        return prevInput;
      });
    } catch (error) {
      console.error("Error fetching input status:", error);
    }
  }, [input.id]);

  useEffect(() => {
    fetchInputStatus();
    const intervalId = setInterval(fetchInputStatus, 5000);
    return () => {
      clearInterval(intervalId);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchInputStatus]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOutput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newOutput.nombre && newOutput.url) {
      const createdOutput = await agregarPuntoPublicacion(input.id, newOutput);
      if (createdOutput) {
        setLocalOutputs([...localOutputs, createdOutput]);
      }
      setNewOutput({ nombre: "", url: "", streamKey: "" });
      closeModal();
    } else {
      alert("Por favor, complete al menos el nombre y la URL.");
    }
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

  const handleToggle = async (outputId, currentState) => {
    if (currentState === "running") {
      setConfirmationModal({
        isOpen: true,
        message: "¿Seguro quieres apagar el Punto de publicación?",
        onConfirm: () => performToggle(outputId, currentState),
      });
    } else {
      performToggle(outputId, currentState);
    }
  };

  const performToggle = async (outputId, currentState) => {
    const newState = currentState === "running" ? "stop" : "start";
    const updatedOutput = await toggleOutputState(outputId, newState);
    setLocalOutputs(
      localOutputs.map((output) =>
        output.id === outputId
          ? { ...output, state: updatedOutput.state }
          : output
      )
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3 space-y-6">
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <div className="flex justify-between p-4 ">
            <Link href="/" className="text-3xl">
              ⬅️
            </Link>
            <h2 className="text-3xl font-bold">{localInput.name}</h2>
            <span className="text-2xl">{localInput.state === "running" ? "🟢" : "🔴"}</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Video Preview</h2>
          <VideoPlayer
            url={localInput.defaultOutputs.HLS}
            isRunning={localInput.state === "running"}
            refreshTrigger={videoRefreshTrigger}
          />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <InputData input={localInput} />
          <InputInfo name={localInput.name} streamId={localInput.streamId} />
          <OutputDefault defaultOutputs={localInput.defaultOutputs} />
        </div>
      </div>

      <div className="md:w-1/3">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Custom Outputs</h2>
          <CustomOutputs
            localOutputs={localOutputs}
            handleEliminarPunto={handleEliminarPunto}
            handleToggle={handleToggle}
          />
          <button
            onClick={openModal}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Agregar Punto de Publicación RTMP
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">RTMP</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa un nombre"
                value={newOutput.nombre}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-gray-400">URL</label>
              <input
                type="text"
                name="url"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la URL"
                value={newOutput.url}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-gray-400">Key</label>
              <input
                type="text"
                name="streamKey"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la Key"
                value={newOutput.streamKey}
                onChange={handleInputChange}
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

export default InputDetails;