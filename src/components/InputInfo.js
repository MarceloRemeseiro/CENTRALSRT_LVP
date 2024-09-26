import React from 'react';
import CopyButton from './CopyButton';

const InputInfo = ({ name, streamId }) => {
  return (
    <div className="px-3 bg-gray-700 rounded-lg p-4 mb-4">
      <p className="mb-2">
        <strong className="text-gray-400">Nombre:</strong>{' '}
        <span className="text-gray-300">{name}</span>
      </p>
      <p className="text-gray-400 mb-1">
        <strong>Stream ID:</strong>
      </p>
      <div className="flex items-center justify-between rounded">
        <p className="text-gray-300 break-all">{streamId}</p>
        <CopyButton text={streamId} />
      </div>
    </div>
  );
};

export default InputInfo;