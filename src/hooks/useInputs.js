import { useState, useCallback } from 'react';

const useInputs = () => {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInputs = useCallback(async () => {
    try {
      const response = await fetch("/api/process/inputs", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al recuperar los inputs");
      }

      const data = await response.json();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setInputs(sortedData || []);
    } catch (error) {
      console.error("Error al cargar los inputs:", error);
      setError("Error al cargar los inputs");
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarPuntoPublicacion = useCallback(async (inputId, { nombre, url, streamKey }) => {
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
      setInputs((prevInputs) =>
        prevInputs.map((input) =>
          input.id === inputId
            ? {
                ...input,
                customOutputs: [...(input.customOutputs || []), newOutput],
              }
            : input
        )
      );
      return newOutput;
    } catch (err) {
      console.error("Error adding publication point:", err);
      return null;
    }
  }, []);

  const eliminarPuntoPublicacion = useCallback(async (inputId, outputId) => {
    try {
      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      const response = await fetch(`/api/process/${inputId}/outputs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outputId: correctedOutputId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInputs((prevInputs) =>
        prevInputs.map((input) =>
          input.id === inputId
            ? {
                ...input,
                customOutputs: input.customOutputs.filter(
                  (output) => output.id !== outputId
                ),
              }
            : input
        )
      );
      return data;
    } catch (error) {
      console.error('Error al eliminar el punto de publicación:', error);
      throw error;
    }
  }, []);

  const toggleOutputState = useCallback(async (outputId, newState) => {
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
      setInputs((prevInputs) =>
        prevInputs.map((input) => ({
          ...input,
          customOutputs: input.customOutputs?.map((output) =>
            output.id === outputId
              ? { ...output, state: updatedOutput.state }
              : output
          ),
        }))
      );
      return updatedOutput;
    } catch (error) {
      console.error('Error al cambiar el estado del output:', error);
      throw error;
    }
  }, []);

  return { 
    inputs, 
    loading, 
    error, 
    fetchInputs, 
    agregarPuntoPublicacion, 
    eliminarPuntoPublicacion, 
    toggleOutputState 
  };
};

export default useInputs;