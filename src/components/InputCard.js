"use client";
import IframePlayer from "../components/IframePlayer";
import { useState } from "react";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
    >
      {copied ? "Copiado!" : "Copiar"}
    </button>
  );
};

const InputCard = ({ input, index }) => {
  console.log(input.defaultOutputs.HTML);
  
  const getStatusIcon = (state) => {
    return state === "running" ? "🟢" : "🔴"; // Emoji for green and red circles
  };

  return (
    <div className="bg-gray-800 text-gray-200 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold mb-2 text-white">INPUT #{index}</h2>
        <span className="text-2xl mb-2">{getStatusIcon(input.state)}</span>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 font-semibold">URL</p>
            <p className="text-sm text-gray-300 break-all">
              srt://lvp.streamingpro.es
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">PORT</p>
            <p className="text-sm text-gray-300">6001</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">LATENCY</p>
            <p className="text-sm text-gray-300">120ms</p>
          </div>
          <div>
            <p className="text-gray-400 font-semibold">TIPO</p>
            <p className="text-sm text-gray-300">CALLER</p>
          </div>
          {/* STREAMID ocupa las dos columnas */}
          <div className="col-span-2">
            <p className="text-gray-400 font-semibold">STREAMID</p>
            <p className="text-sm text-gray-300 break-all">
              {`${input.streamId}.stream,mode:publish`}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <IframePlayer url={input.defaultOutputs.HTML} />
      </div>

     {/*  <p>
        <strong className="text-gray-400">Nombre:</strong> {input.name}
      </p>
      <p>
        <strong className="text-gray-400">Descripción:</strong>{" "}
        {input.description}
      </p>
      <p>
        <strong className="text-gray-400">Fecha de creación:</strong>{" "}
        {input.createdAtFormatted}
      </p> */}
      <p>
        <strong className="text-gray-400">Stream ID:</strong> {input.streamId}
      </p>

      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        Outputs por Defecto
      </h3>
      <div className="bg-gray-700 p-3 rounded mb-4">
        {Object.entries(input.defaultOutputs).map(([key, value]) => (
          <div key={key} className="mb-2 flex items-center justify-between">
            <div>
              <p>
                <strong className="text-gray-300">{key}:</strong>
              </p>
              <p className="text-sm break-all text-gray-400">{value}</p>
            </div>
            <CopyButton text={value} />
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        Outputs Personalizados
      </h3>
      <div className="space-y-2">
        {input.customOutputs.map((output, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded">
            <p>
              <strong className="text-gray-300">Nombre:</strong> {output.name}
              <span className="text-base mb-2">
                {getStatusIcon(output.state)}
              </span>
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm break-all text-gray-400">
                {output.address}
              </p>
            </div>
            {output.key && (
              <div className="flex items-center justify-between mt-1">
                <p>
                  <strong className="text-gray-300">Key:</strong>{" "}
                  <span className="text-sm break-all text-gray-400">
                    {output.key}
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InputCard;
