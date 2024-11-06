// components/MusicEmbed.tsx
import React, { useState, useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import LoadingSpinner from './LoadingSpinner'

interface MusicEmbedProps {
  embedUrl: string
  title: string
  platform: 'spotify' | 'soundcloud'
}

const MusicEmbed: React.FC<MusicEmbedProps> = ({
  embedUrl,
  title,
  platform,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })

  const formattedEmbedUrl = useMemo(() => {
    if (platform === 'soundcloud') {
      try {
        // Extract the original URL from the player URL
        const url = new URL(embedUrl);
        const originalUrl = url.searchParams.get('url');

        if (!originalUrl) return embedUrl;

        // Create new player URL with clean parameters
        return `https://w.soundcloud.com/player/?url=${originalUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
      } catch (error) {
        console.error('Error formatting SoundCloud URL:', error);
        return embedUrl;
      }
    }
    return embedUrl; // For Spotify, use as is
  }, [embedUrl, platform]);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsLoaded(true), 1000) // Delay for iframe loading
      return () => clearTimeout(timer)
    }
  }, [inView])

  console.log('Platform:', platform);
  console.log('Original Embed URL:', embedUrl);
  console.log('Formatted Embed URL:', formattedEmbedUrl);

  return (
    <div ref={ref} className={`w-full h-full ${
      platform === 'soundcloud' ? 'soundcloud-embed-container' : 'spotify-embed-container'
    }`}>
      <iframe
        className={platform === 'soundcloud' ? 'soundcloud-iframe' : 'w-full h-full'}
        src={formattedEmbedUrl}
        title={title}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}

export default MusicEmbed
