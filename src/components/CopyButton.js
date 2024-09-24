import React, { useState } from 'react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar el texto: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
    >
      {copied ? "¡Copiado!" : "Copiar"}
    </button>
  );
};

export default CopyButton;