import React, { useEffect, useRef } from 'react';
import { useYouTubeAPI } from '@components/media/YouTubeAPIProvider';
import { useInView } from 'react-intersection-observer';

const YouTubeEmbed = ({ embedId, title, className = '' }) => {
  const apiReady = useYouTubeAPI();
  const playerRef = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0.75,
    triggerOnce: true,
  });

  // Detect if the device is mobile
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const setHighResolution = (player) => {
    const qualities = player.getAvailableQualityLevels();
    const savedQuality = localStorage.getItem('ytHighQuality') || 'hd1080';

    // Set the preferred quality based on saved settings or available quality
    if (qualities.includes(savedQuality)) {
      player.setPlaybackQuality(savedQuality);
    } else if (qualities.includes('hd720')) {
      player.setPlaybackQuality('hd720');
    } else if (qualities.length > 0) {
      player.setPlaybackQuality(qualities[0]);
    }
  };

  const saveQualityPreference = () => {
    localStorage.setItem('ytHighQuality', 'hd1080');
  };

  useEffect(() => {
    const createPlayer = () => {
      playerRef.current = new window.YT.Player(`youtube-player-${embedId}`, {
        videoId: embedId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event) => {
            saveQualityPreference(); // Save the preference
            setHighResolution(event.target);
          },
          onStateChange: (event) => {
            // Reapply high quality during play or buffering, including for mobile
            if (event.data === window.YT.PlayerState.BUFFERING || event.data === window.YT.PlayerState.PLAYING) {
              setHighResolution(event.target);
            }
          },
        },
      });
    };

    if (apiReady && inView && !playerRef.current) {
      createPlayer();
    }
  }, [apiReady, inView, embedId]);

  return (
    <div
      ref={ref}
      className={`youtube-embed relative overflow-hidden ${className} aspect-w-16 aspect-h-9 w-full`}
    >
      <div id={`youtube-player-${embedId}`} className="w-full h-full"></div>
    </div>
  );
};

export default YouTubeEmbed;
