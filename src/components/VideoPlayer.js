import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ url, isRunning, refreshTrigger }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [key, setKey] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    setKey(prev => prev + 1);
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
          setHasVideo(true);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setHasVideo(false);
          }
        });

        hlsRef.current = hls;
      } else {
        setHasVideo(false);
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
    <div className="video-container relative" style={{ aspectRatio: '16 / 9', backgroundColor: '#0000ff' }}>
      <video
        key={key}
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
        muted
        style={{ display: hasVideo ? 'block' : 'none' }}
      />
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
          <p className="w-full text-center">NO HAY VIDEO DISPONIBLE</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;