"use client";

import React, { useEffect, useState } from "react";
import { restreamerAPIConnection } from "../services/restreamer";
import InputCard from "../components/InputCard";
import ModalForm from "@/components/ModalForm";

export default function Home() {
  const [inputs, setInputs] = useState([]);
  const [deleteId, setDeleteId] = useState(""); // Nuevo estado para la ID que se desea eliminar
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log(inputs);

  useEffect(() => {
    fetchInputs();
  }, []);

  const fetchInputs = async () => {
    try {
      const data = await restreamerAPIConnection();
      setInputs(data);
    } catch (error) {
      console.error("Error fetching inputs:", error);
    }
  };

  const handleUpdateInput = (updatedInput) => {
    setInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === updatedInput.id ? updatedInput : input
      )
    );
  };

  // Nueva función para eliminar el output
  const eliminarPuntoPublicacion = async (outputId) => {

    try {
      const response = await fetch(`/api/process/${outputId}/outputs/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete output");
      }

      // Actualizar el estado de los inputs si es necesario
      console.log("Output eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar el punto de publicación:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (deleteId.trim() !== "") {
      // Elimina el prefijo 'restreamer-ui:egress:rtmp:' si está presente
      eliminarPuntoPublicacion(deleteId);
      setDeleteId(""); // Limpiar el campo después de eliminar
    }
  };

  const handleCreateProcess = async (metadata) => {
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error("Error al crear el proceso");
      }

      const data = await response.json();
      console.log("Proceso creado:", data);

      // También puedes hacer un POST al endpoint de metadata si es necesario
      await fetch(`/api/process/${data.id}/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: metadata.nombre,
          description: metadata.descripcion,
        }),
      });

      console.log("Metadata actualizada.");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        StreamingPro Inputs
      </h1>
      <div className="mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Crear nuevo proceso
        </button>

        {isModalOpen && (
          <ModalForm
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateProcess}
          />
        )}
      </div>
      {/* Formulario para eliminar outputs */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="text"
            value={deleteId}
            onChange={(e) => setDeleteId(e.target.value)}
            placeholder="Ingresa el ID del output"
            className="p-2 border rounded bg-gray-800 text-white"
          />
          <button
            type="submit"
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Eliminar Output
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inputs.map((input, index) => (
          <InputCard
            key={input.id}
            input={input}
            index={index + 1}
            onUpdateInput={handleUpdateInput}
          />
        ))}
      </div>
    </main>
  );
}
