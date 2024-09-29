"use client";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import InputInfo from "./InputInfo";
import OutputDefault from "./OutputDefault";
import CustomOutputs from "./CustomOutputs";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import InputData from "./InputData";
import Link from "next/link";
import { useInputLogic } from "../hooks/useInputLogic";

const InputDetails = ({
  input,
  agregarPuntoPublicacion,
  eliminarPuntoPublicacion,
  toggleOutputState,
}) => {
  const {
    localInput,
    localOutputs,
    isModalOpen,
    videoRefreshTrigger,
    newOutput,
    confirmationModal,
    openModal,
    closeModal,
    handleInputChange,
    handleSubmit,
    handleEliminarPunto,
    handleToggle,
    setConfirmationModal,
  } = useInputLogic(input, agregarPuntoPublicacion, eliminarPuntoPublicacion, toggleOutputState);

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