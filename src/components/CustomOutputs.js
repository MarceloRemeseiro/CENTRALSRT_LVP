import React from "react";

const CustomOutputs = ({ localOutputs, handleEliminarPunto, handleToggle }) => {
  const getSwitchColor = (output) => {
    if (output.state === "failed") return "bg-red-500";
    if (output.isTogglingOn) return "bg-gray-300";
    return output.state === "running" ? "bg-green-500" : "bg-gray-300";
  };

  const switchStyle = (output) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition ${getSwitchColor(
      output
    )}`;

  const circleStyle = (output) =>
    `inline-block h-4 w-4 rounded-full bg-white transition transform ${
      output.state === "running" || output.isTogglingOn
        ? "translate-x-6"
        : "translate-x-1"
    }`;

  // Verificar si localOutputs es un array y tiene elementos
  if (!Array.isArray(localOutputs) || localOutputs.length === 0) {
    return null;
  }

  return (
    <>
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        PUNTOS DE PUBLICACIÓN
      </h3>
      <div className="space-y-2">
        {localOutputs.map((output, index) => (
          <div key={output.id} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <p>
                <strong className="text-gray-300">Nombre:</strong> {output.name}
              </p>
              <div
                className={switchStyle(output)}
                onClick={() => handleToggle(output.id, output.state, index)}
              >
                <span className={circleStyle(output)} />
              </div>
            </div>
            <p className="text-sm break-all text-gray-400">
              <strong className="text-gray-300">URL : </strong> {output.address}
            </p>
            <p className="text-sm break-all text-gray-400">
              <strong className="text-gray-300">KEY : </strong> {output.key}
            </p>
            <button
              onClick={() => handleEliminarPunto(output.id)}
              className="mt-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default CustomOutputs;
