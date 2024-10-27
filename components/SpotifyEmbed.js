// components/SpotifyEmbed.js

import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const SpotifyEmbed = ({ embedUrl, title }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 1000); // Delay to ensure the iframe has time to load

      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <div ref={ref} className="spotify-embed-container" style={{ zIndex: 10000 }}> {/* Increase z-index here */}
      {!isLoaded && (
        <div className="spotify-loading">
          <p className="text-lg font-semibold">Loading Spotify player...</p>
        </div>
      )}
      {inView && (
        <iframe
          src={embedUrl}
          className={`spotify-iframe ${isLoaded ? 'loaded' : ''}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title={`Spotify album ${title}`}
          onLoad={() => setIsLoaded(true)}
          style={{ zIndex: 10000 }} // Ensure the iframe has the same high z-index
        />
      )}
    </div>
  );
};

export default SpotifyEmbed;