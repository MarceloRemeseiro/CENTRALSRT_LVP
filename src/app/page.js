"use client";
import { useState, useEffect } from "react";
import InputCard from "../components/InputCard";
import Login from "../components/Login";

function Home() {
  const [user, setUser] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchInputs();
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setInputs([]);
  };

  const fetchInputs = async () => {
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
  };

  const updateInput = (updatedInput) => {
    setInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === updatedInput.id ? updatedInput : input
      )
    );
  };

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
          customOutputs: input.customOutputs.map((output) =>
            output.id === outputId
              ? { ...output, state: updatedOutput.state }
              : output
          ),
        }))
      );

      return updatedOutput;
    } catch (error) {
      console.error("Error toggling output state:", error);
      return { state: "failed" };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">StreamingPro Inputs</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar sesión
        </button>
      </div>
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

export default Home;