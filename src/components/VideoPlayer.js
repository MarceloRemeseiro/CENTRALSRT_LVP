import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ url, isRunning }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        hlsRef.current = new Hls();
        hlsRef.current.loadSource(url);
        hlsRef.current.attachMedia(videoRef.current);
        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isRunning) {
            videoRef.current
              .play()
              .catch((e) => console.error("Error autoplay:", e));
          }
        });
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = url;
        if (isRunning) {
          videoRef.current
            .play()
            .catch((e) => console.error("Error autoplay:", e));
        }
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url, isRunning]);

  useEffect(() => {
    if (videoRef.current) {
      if (isRunning) {
        videoRef.current
          .play()
          .catch((e) => console.error("Error autoplay:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isRunning]);

  return (
    <div className="mb-2">
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full"
          controls
          playsInline
          muted // Añadir muted para permitir autoplay en más navegadores
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
