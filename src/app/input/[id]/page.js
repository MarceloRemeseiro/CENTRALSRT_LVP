"use client";
import React, { useState, useEffect } from "react";
import InputDetails from "../../../components/InputDetails";
import useAuth from "../../../hooks/useAuth";
import useInputs from "../../../hooks/useInputs";

export default function InputPage({ params }) {
  const { user } = useAuth();
  const { 
    agregarPuntoPublicacion, 
    eliminarPuntoPublicacion, 
    toggleOutputState 
  } = useInputs();

  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = params;

  useEffect(() => {
    if (id && user) {
      fetchInput();
    }
  }, [id, user]);

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

  const handleAgregarPuntoPublicacion = async (inputId, data) => {
    const newOutput = await agregarPuntoPublicacion(inputId, data);
    if (newOutput) {
      setInput((prevInput) => ({
        ...prevInput,
        customOutputs: [...(prevInput.customOutputs || []), newOutput],
      }));
    }
    return newOutput;
  };

  const handleEliminarPuntoPublicacion = async (inputId, outputId) => {
    await eliminarPuntoPublicacion(inputId, outputId);
    setInput((prevInput) => ({
      ...prevInput,
      customOutputs: prevInput.customOutputs.filter(
        (output) => output.id !== outputId
      ),
    }));
  };

  const handleToggleOutputState = async (outputId, newState) => {
    const updatedOutput = await toggleOutputState(outputId, newState);
    setInput((prevInput) => ({
      ...prevInput,
      customOutputs: prevInput.customOutputs.map((output) =>
        output.id === outputId
          ? { ...output, state: updatedOutput.state }
          : output
      ),
    }));
    return updatedOutput;
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
        agregarPuntoPublicacion={handleAgregarPuntoPublicacion}
        eliminarPuntoPublicacion={handleEliminarPuntoPublicacion}
        toggleOutputState={handleToggleOutputState}
      />
    </div>
  );
}
