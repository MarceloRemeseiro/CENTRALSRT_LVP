"use client";
import { useEffect, useState } from "react";
import InputCard from "../components/InputCard";
import Login from "../components/Login";
import useAuth from "../hooks/useAuth";
import useInputs from "../hooks/useInputs";

function Home() {
  const { user, loading: authLoading, handleLogin, handleLogout } = useAuth();
  const { 
    inputs, 
    loading: inputsLoading, 
    error, 
    fetchInputs, 
    agregarPuntoPublicacion, 
    eliminarPuntoPublicacion, 
    toggleOutputState 
  } = useInputs();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchInputs();
    }
  }, [user, fetchInputs]);

  if (!isClient) {
    return null; // O un placeholder si lo prefieres
  }

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (inputsLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
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