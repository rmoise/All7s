// components/media/YouTubeEmbed.tsx

import React from 'react'

interface YouTubeEmbedProps {
  embedId: string
  title: string
  className?: string
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  embedId,
  title,
  className,
}) => {
  return (
    <div className={`video-responsive ${className || ''}`}>
      <iframe
        width="853"
        height="480"
        src={`https://www.youtube.com/embed/${embedId}?rel=0&modestbranding=1&hd=1&quality=hd1080`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

export default YouTubeEmbed
