import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ url, isRunning, refreshTrigger }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);  // Esto forzará un re-render del video
  }, [refreshTrigger]);

  useEffect(() => {
    let hls = hlsRef.current;

    const initPlayer = () => {
      if (isRunning && url && Hls.isSupported()) {
        if (hls) {
          hls.destroy();
        }
        hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(url);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
        });

        hlsRef.current = hls;
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, isRunning, key]);

  return (
    <video
      key={key}
      ref={videoRef}
      className="w-full h-auto mb-4"
      controls
      playsInline
      muted
      style={{ backgroundColor: '#000' }}
    />
  );
};

export default VideoPlayer;