// components/MusicEmbed.tsx
import React, { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

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

  // Choose formatted embed URL based on the platform
  const formattedEmbedUrl =
    platform === 'soundcloud' && embedUrl
      ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(
          embedUrl
        )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`
      : embedUrl // Use embedUrl directly for Spotify

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsLoaded(true), 1000) // Delay for iframe loading
      return () => clearTimeout(timer)
    }
  }, [inView])

  console.log('Embed URL for iframe:', formattedEmbedUrl) // Log to ensure it's correct

  return (
    <div
      ref={ref}
      className={`${platform}-embed-container`}
      style={{ position: 'relative' }}
    >
      {!isLoaded && (
        <div className={`${platform}-loading`}>
          <p className="text-lg font-semibold">
            Loading {platform === 'spotify' ? 'Spotify' : 'SoundCloud'}{' '}
            player...
          </p>
        </div>
      )}
      {inView && (
        <iframe
          src={formattedEmbedUrl}
          className={`${platform}-iframe ${isLoaded ? 'loaded' : ''}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          title={`${
            platform === 'spotify' ? 'Spotify' : 'SoundCloud'
          } ${title}`}
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
  )
}

export default MusicEmbed
