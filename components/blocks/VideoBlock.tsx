// components/blocks/VideoBlock.tsx

import React, { useRef, useEffect } from 'react'
import YouTubeEmbed from '@components/media/YouTubeEmbed'
import Grid from '@components/common/Grid/Grid'
import { extractYouTubeID } from '@utils/extractYouTubeID'
import { useNavbar } from '@context/NavbarContext'

interface VideoBlockProps {
  lookTitle: string
  heroVideoLink: string
  additionalVideos?: Array<{
    _key: string
    url: string
  }>
}

const VideoBlock: React.FC<VideoBlockProps> = ({
  lookTitle,
  heroVideoLink,
  additionalVideos,
}) => {
  if (!lookTitle || !heroVideoLink) {
    console.warn('VideoBlock: Missing required props')
    return null
  }

  const heroVideoID = extractYouTubeID(heroVideoLink)
  const lookId = lookTitle.replace(/\s+/g, '-')

  const sectionId = lookTitle.replace(/[^a-zA-Z0-9]/g, '')

  return (
    <section
      id="look-section"
      className="relative z-10 w-full py-16"
      data-section-type="look"
    >
      <div className="container mx-auto px-4">
        <h2 className="mb-16 text-center text-6xl font-Headline bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 text-transparent font-bold">
          {lookTitle}
        </h2>

        {/* Hero Video */}
        {heroVideoID && (
          <Grid columns={{ default: 1 }} maxWidth="5xl" center gap={32}>
            <div className="border-8 border-black/50 rounded-lg overflow-hidden">
              <YouTubeEmbed
                embedId={heroVideoID}
                title="Hero YouTube video"
                className="w-full"
              />
            </div>
          </Grid>
        )}

        {/* Additional Videos */}
        {additionalVideos && additionalVideos.length > 0 && (
          <div className="mt-32">
            <Grid columns={{ default: 1 }} maxWidth="5xl" center gap={32}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                {additionalVideos.map((videoObj, i) => {
                  const videoId = extractYouTubeID(videoObj.url)
                  return videoId ? (
                    <div
                      key={`vid-${i}`}
                      className="border-8 border-black/50 rounded-lg overflow-hidden"
                    >
                      <YouTubeEmbed
                        embedId={videoId}
                        title={`YouTube video ${i + 1}`}
                        className="w-full"
                      />
                    </div>
                  ) : null
                })}
              </div>
            </Grid>
          </div>
        )}
      </div>
    </section>
  )
}

export default VideoBlock
