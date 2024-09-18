import React, { useEffect, useRef } from "react";

const IframePlayer = ({ url, isRunning }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (isRunning && iframeRef.current) {
      // Forzar la recarga del iframe
      iframeRef.current.src = iframeRef.current.src;
    }
  }, [isRunning]);

  return (
    <div>
      <iframe
        ref={iframeRef}
        src={url}
        width="100%"
        height="250px"
        allow="autoplay; fullscreen"
        allowFullScreen
        key={isRunning ? "running" : "not-running"}
      ></iframe>
    </div>
  );
};

export default IframePlayer;
