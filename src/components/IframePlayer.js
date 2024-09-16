const IframePlayer = ({ url }) => {
  return (
    <div>
      <iframe
        src={url}
        width="100%"
        height="250px"
        allow="autoplay; fullscreen"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default IframePlayer;
