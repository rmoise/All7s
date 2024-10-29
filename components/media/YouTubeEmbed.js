// components/media/YouTubeEmbed.js

import React, { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';

const YouTubeEmbed = ({ embedId, title, className = '' }) => {
  const playerRef = useRef(null);

  const opts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      iv_load_policy: 3,
      vq: 'hd1080', // Set default preferred quality here
    },
  };

  const enforceQuality = (player) => {
    const qualities = player.getAvailableQualityLevels();
    const preferredQualities = ['highres', 'hd2160', 'hd1440', 'hd1080', 'hd720'];

    for (const quality of preferredQualities) {
      if (qualities.includes(quality)) {
        player.setPlaybackQuality(quality);
        break;
      }
    }
  };

  useEffect(() => {
    const enforceHighResolution = () => {
      if (playerRef.current) {
        enforceQuality(playerRef.current);
      }
    };

    const qualityInterval = setInterval(enforceHighResolution, 3000); // Recheck every 3 seconds

    return () => clearInterval(qualityInterval);
  }, []);

  const handleReady = (event) => {
    playerRef.current = event.target;
    enforceQuality(playerRef.current); // Enforce on initial load
  };

  const handleStateChange = (event) => {
    if (
      event.data === window.YT.PlayerState.BUFFERING ||
      event.data === window.YT.PlayerState.PLAYING
    ) {
      enforceQuality(event.target); // Re-enforce quality on playback
    }
  };

  return (
    <div className={`youtube-embed ${className} relative overflow-hidden w-full`} style={{ aspectRatio: '16 / 9' }}>
      <YouTube
        videoId={embedId}
        opts={opts}
        onReady={handleReady}
        onStateChange={handleStateChange}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

YouTubeEmbed.propTypes = {
  embedId: PropTypes.string.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
};

export default YouTubeEmbed;
