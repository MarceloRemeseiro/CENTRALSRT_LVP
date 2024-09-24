import React from 'react';
import CopyButton from './CopyButton';

const OutputDefault = ({ defaultOutputs }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        OUTPUTS POR DEFECTO
      </h3>
      <div className="bg-gray-700 p-3 rounded mb-4">
        {Object.entries(defaultOutputs).map(([key, value]) => (
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
    </>
  );
};

export default OutputDefault;