"use client";
import { useState } from "react";

const ModalForm = ({ onClose, onSubmit }) => {
  const [tipo, setTipo] = useState("SRT");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !descripcion) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const metadata = {
      tipo,
      nombre,
      descripcion,
    };

    // Llama a la función onSubmit que pasaste como prop para manejar la lógica de envío
    onSubmit(metadata);
    onClose(); // Cerrar el modal después de enviar
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Crear nuevo proceso</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Tipo de Proceso</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg"
            >
              <option value="SRT">SRT</option>
              <option value="RTMP">RTMP</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Ingresa el nombre del proceso"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-lg"
              placeholder="Ingresa la descripción del proceso"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalForm;
