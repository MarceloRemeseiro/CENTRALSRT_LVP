"use client";
import { useState, useEffect } from "react";
import InputCard from "../components/InputCard"; // El componente hijo

export default function Page() {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch para obtener los inputs y outputs
  const fetchInputs = async () => {
    try {
      const response = await fetch("/api/process/inputs", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al recuperar los inputs");
      }

      const data = await response.json();

      // Ordenamos los inputs por el nombre aquí
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setInputs(sortedData || []); // Aseguramos que siempre sea una lista
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar los inputs:", error);
      setError("Error al cargar los inputs");
      setLoading(false);
    }
  };

  // Función para actualizar un input
  const updateInput = (updatedInput) => {
    setInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === updatedInput.id ? updatedInput : input
      )
    );
  };

  // Función para agregar un punto de publicación
  const agregarPuntoPublicacion = async (id, { nombre, url, streamKey }) => {
    try {
      const response = await fetch(`/api/process/${id}/outputs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nombre,
          address: url,
          streamKey: streamKey,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar punto de publicación");
      }

      const createdOutput = await response.json();
      updateInput({
        ...inputs.find((input) => input.id === id),
        customOutputs: [
          ...(inputs.find((input) => input.id === id).customOutputs || []),
          createdOutput,
        ],
      });
    } catch (error) {
      console.error("Error al agregar el punto de publicación:", error);
    }
  };

  // Función para eliminar un punto de publicación
  const eliminarPuntoPublicacion = async (inputId, outputId) => {
    try {
      const response = await fetch(`/api/process/${outputId}/outputs`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el punto de publicación");
      }

      updateInput({
        ...inputs.find((input) => input.id === inputId),
        customOutputs: inputs
          .find((input) => input.id === inputId)
          .customOutputs.filter((output) => output.id !== outputId),
      });
    } catch (error) {
      console.error("Error al eliminar el punto de publicación:", error);
    }
  };

  const toggleOutputState = async (outputId, newState) => {
    try {
      const response = await fetch(`/api/process/${outputId}/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newState }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to toggle output state');
      }
  
      const updatedOutput = await response.json();
      
      // Actualizar el estado global si es necesario
      setInputs(prevInputs => 
        prevInputs.map(input => ({
          ...input,
          customOutputs: input.customOutputs.map(output =>
            output.id === outputId ? { ...output, state: updatedOutput.state } : output
          )
        }))
      );
  
      return updatedOutput;
    } catch (error) {
      console.error('Error toggling output state:', error);
      // Si hay un error, consideramos que el estado es "failed"
      return { state: "failed" };
    }
  };
  
  useEffect(() => {
    fetchInputs();
  }, []);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        StreamingPro Inputs
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inputs.map((input, index) => (
          <InputCard
            key={input.id}
            input={input}
            index={index}
            agregarPuntoPublicacion={agregarPuntoPublicacion}
            eliminarPuntoPublicacion={eliminarPuntoPublicacion}
            toggleOutputState={toggleOutputState}
          />
        ))}
      </div>
    </main>
  );
}
