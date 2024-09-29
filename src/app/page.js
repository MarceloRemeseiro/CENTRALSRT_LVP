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
      console.log(`Intentando cambiar el estado de ${outputId} a ${newState}`);
      
      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      
      const response = await fetch(`/api/process/${encodeURIComponent(correctedOutputId)}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      return data;
    } catch (error) {
      console.error('Error al cambiar el estado del output:', error);
      throw error;
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