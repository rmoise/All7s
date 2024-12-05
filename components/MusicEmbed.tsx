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
    if (platform === 'spotify') {
      const url = new URL(embedUrl)
      url.searchParams.set('theme', '0')
      return url.toString()
    }
    if (platform === 'soundcloud') {
      try {
        const url = new URL(embedUrl)
        const originalUrl = url.searchParams.get('url')
        if (!originalUrl) return embedUrl
        return `https://w.soundcloud.com/player/?url=${originalUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
      } catch (error) {
        return embedUrl
      }
    }
    return embedUrl
  }, [embedUrl, platform])

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsLoaded(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [inView])

  if (platform === 'spotify') {
    return (
      <div ref={ref} className="w-full h-[480px] sm:h-[500px]">
        <div className="w-full h-full relative">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={formattedEmbedUrl}
            title={title}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            style={{ border: 0 }}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="w-full h-full soundcloud-embed-container">
      <iframe
        className="soundcloud-iframe"
        src={formattedEmbedUrl}
        title={title}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}

export default MusicEmbed
