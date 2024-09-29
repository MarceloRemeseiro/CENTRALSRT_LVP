"use client";
import React, { useState, useEffect } from "react";
import InputDetails from "../../../components/InputDetails";

export default function InputPage({ params }) {
  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = params;

  useEffect(() => {
    if (id) {
      fetchInput();
    }
  }, [id]);

  const fetchInput = async () => {
    try {
      const response = await fetch(`/api/process/${id}/input`);
      if (!response.ok) {
        throw new Error("Failed to fetch input");
      }
      const data = await response.json();
      setInput(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching input data");
      setLoading(false);
    }
  };

  const agregarPuntoPublicacion = async (
    inputId,
    { nombre, url, streamKey }
  ) => {
    try {
      const response = await fetch(`/api/process/${inputId}/outputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nombre, address: url, streamKey }),
      });
      if (!response.ok) {
        throw new Error("Failed to add publication point");
      }
      const newOutput = await response.json();
      setInput((prevInput) => ({
        ...prevInput,
        customOutputs: [...(prevInput.customOutputs || []), newOutput],
      }));
      return newOutput;
    } catch (err) {
      console.error("Error adding publication point:", err);
      return null;
    }
  };

  const eliminarPuntoPublicacion = async (inputId, outputId) => {
    try {
      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      console.log(`Intentando eliminar output. Input ID: ${inputId}, Output ID corregido: ${correctedOutputId}`);

      const response = await fetch(`/api/process/${inputId}/outputs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outputId: correctedOutputId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta de eliminación:', data);
      return data;
    } catch (error) {
      console.error('Error al eliminar el punto de publicación:', error);
      throw new Error('Error al eliminar el punto de publicación');
    }
  };

  const toggleOutputState = async (outputId, newState) => {
    try {
      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      const response = await fetch(`/api/process/${correctedOutputId}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newState }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle output state");
      }
      const updatedOutput = await response.json();
      setInput((prevInput) => ({
        ...prevInput,
        customOutputs: prevInput.customOutputs.map((output) =>
          output.id === outputId
            ? { ...output, state: updatedOutput.state }
            : output
        ),
      }));
      return updatedOutput;
    } catch (err) {
      console.error("Error toggling output state:", err);
      throw err; // Propagar el error para que pueda ser manejado en InputDetails
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!input) return <div className="text-center mt-8">No input found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <InputDetails
        input={input}
        agregarPuntoPublicacion={agregarPuntoPublicacion}
        eliminarPuntoPublicacion={eliminarPuntoPublicacion}
        toggleOutputState={toggleOutputState}
      />
    </div>
  );
}
