import React, { useEffect, useRef, useState } from 'react';
import { useYouTubeAPI } from '../media/YouTubeAPIProvider';
import { useInView } from 'react-intersection-observer';

const YouTubeEmbed = ({ embedId, title, className, size }) => {
  const apiReady = useYouTubeAPI();
  const playerRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const forceHighestQuality = (player) => {
    const qualities = player.getAvailableQualityLevels();

    // Try to set quality to 1080p, then fall back to the highest available
    if (qualities.includes('hd1080')) {
      player.setPlaybackQuality('hd1080');
    } else if (qualities.length > 0) {
      player.setPlaybackQuality(qualities[0]);
    }

    // Additionally, try to set the quality using setOption
    player.setOption('quality', 'hd1080');
  };

  useEffect(() => {
    if (apiReady && inView && !playerRef.current) {
      playerRef.current = new window.YT.Player(`youtube-player-${embedId}`, {
        videoId: embedId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          hd: 1,
          playsinline: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
        },
        events: {
          onReady: (event) => {
            event.target.setSize(event.target.getIframe().parentNode.offsetWidth, event.target.getIframe().parentNode.offsetHeight);
            forceHighestQuality(event.target);
            setIsPlayerReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.BUFFERING ||
                event.data === window.YT.PlayerState.PLAYING) {
              forceHighestQuality(event.target);
            }
          },
        },
      });
    }
  }, [apiReady, inView, embedId]);

  useEffect(() => {
    const handleResize = () => {
      if (playerRef.current && playerRef.current.getIframe()) {
        const iframe = playerRef.current.getIframe();
        playerRef.current.setSize(iframe.parentNode.offsetWidth, iframe.parentNode.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sizeClasses = {
    sm: 'w-full h-[144px] sm:h-[224px]', // 18 * 8px, 28 * 8px
    md: 'w-full h-[192px] sm:h-[280px]', // 24 * 8px, 35 * 8px
    lg: 'w-full h-[240px] sm:h-[336px]', // 30 * 8px, 42 * 8px
    xl: 'w-full h-[288px] sm:h-[392px]', // 36 * 8px, 49 * 8px
    '2xl': 'w-full h-[336px] sm:h-[448px]', // 42 * 8px, 56 * 8px
    hero: 'w-full h-[344px] sm:h-[480px] md:h-[552px] lg:h-[688px] xl:h-[744px]',
    additional: 'w-full h-[240px] sm:h-[360px] md:h-[405px]', // 30 * 8px, 45 * 8px, 50.625 * 8px
  };

  return (
    <div ref={ref} className={`youtube-embed ${sizeClasses[size] || sizeClasses.md} ${className} relative overflow-hidden`}>
      <div
        id={`youtube-player-${embedId}`}
        className="w-full h-full"
      ></div>
    </div>
  );
};

export default YouTubeEmbed;
