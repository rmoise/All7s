// components/media/MusicEmbed.js
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const MusicEmbed = ({ embedUrl, title, type }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1000); // Delay to ensure smooth loading

      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="music-embed-container"
      style={{
        zIndex: 10000,
        maxHeight: '80vh',
        width: '100%',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {!isLoaded && (
        <div className="music-loading">
          <p className="text-lg font-semibold">Loading {type} player...</p>
        </div>
      )}
      {inView && (
        <iframe
          src={embedUrl}
          className={`music-iframe ${isLoaded ? 'loaded' : ''}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title={`${type} album ${title}`}
          onLoad={() => setIsLoaded(true)}
          style={{
            zIndex: 10001,
            overflow: 'auto',
            height: '100%',
            border: 'none',
          }}
        />
      )}
    </div>
  );
};

export default MusicEmbed;
