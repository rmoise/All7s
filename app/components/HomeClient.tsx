'use client'

import ClientOnly from '@components/layout/ClientOnly'
import { ErrorBoundary } from '@components/common/ErrorBoundary'
import { useNavbar } from '@context/NavbarContext'
import MusicBlock from '@components/blocks/MusicBlock'
import VideoBlock from '@components/blocks/VideoBlock'
import BackgroundVideoBlock from '@components/blocks/BackgroundVideoBlock'
import HeroBanner from '@components/home/HeroBanner'
import About from '@components/home/About'
import Newsletter from '@components/common/Newsletter'
import { useCallback, useEffect, useState } from 'react'
import { getClient } from '@lib/sanity'
import { Album } from '@types'

// Define component props types
interface MusicBlockProps {
  listenTitle: string
  description?: string
  albums?: Array<{
    _ref: string
    _type: 'reference'
    _key: string
  }>
}

interface VideoBlockProps {
  lookTitle: string
  heroVideoLink: string
  additionalVideos: any[]
}

interface AboutProps {
  body: any[]
  image: any
  alignment: 'left' | 'right'
}

interface NewsletterProps {
  newsletter: {
    headline: string
    description: string
    ctaText: string
    placeholderText: string
    formName: string
  }
}

// Content block interfaces
interface BaseContentBlock {
  _key: string
  _type: string
}

interface MusicBlockContent extends BaseContentBlock {
  _type: 'musicBlock'
  listenTitle: string
  description?: string
  albums: Array<{
    _ref: string
    _type: 'reference'
    _key: string
  }>
  resolvedAlbums?: Album[]
}

interface VideoBlockContent extends BaseContentBlock {
  _type: 'videoBlock'
  lookTitle: string
  heroVideoLink: string
  additionalVideos: any[]
}

interface BackgroundVideoBlockContent extends BaseContentBlock {
  _type: 'backgroundVideoBlock'
  backgroundVideoUrl: string
  backgroundVideoFile: any
  posterImage: any
}

interface HeroBannerContent extends BaseContentBlock {
  _type: 'heroBanner'
  backgroundImage: any
  smallText: string
  midText: string
  largeText1: string
  cta: any
}

interface AboutContent extends BaseContentBlock {
  _type: 'about'
  body: any[]
  image: any
  alignment: 'left' | 'right'
}

interface NewsletterContent extends BaseContentBlock {
  _type: 'newsletter'
  headline: string
  description: string
  ctaText: string
  placeholderText: string
  formName: string
  notification?: {
    title: string
    description: string
    showSocialLinks: boolean
    socialLinksTitle: string
    socialLinks: Array<{
      platform: string
      url: string
      color: {
        hex: string
      }
    }>
  }
}

type ContentBlock =
  | MusicBlockContent
  | VideoBlockContent
  | BackgroundVideoBlockContent
  | HeroBannerContent
  | AboutContent
  | NewsletterContent

interface HomeClientProps {
  contentBlocks: ContentBlock[]
}

export default function HomeClient({ contentBlocks }: HomeClientProps) {
  const { refs } = useNavbar()
  const [resolvedBlocks, setResolvedBlocks] = useState<ContentBlock[]>(contentBlocks)
  const [isLoading, setIsLoading] = useState(true)

  const newsletterBlock = contentBlocks.find(block => block._type === 'newsletter') as NewsletterContent

  console.log('Newsletter in HomeClient:', {
    block: newsletterBlock,
    hasNotification: !!newsletterBlock?.notification
  })

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log({
        contentBlocks,
        availableSections: Array.from(
          document.querySelectorAll('section[id]')
        ).map((s) => s.id),
      })
    }
  }, [contentBlocks])

  const resolveAlbumReferences = async (block: MusicBlockContent) => {
    if (block._type !== 'musicBlock' || !block.albums?.length) {
      console.log('No albums to resolve:', block)
      return block
    }

    const refs = block.albums.map(album => album._ref)
    console.log('Resolving album refs:', refs)

    const query = `*[_type == "album" && _id in $refs]{
      _id,
      _key,
      albumSource,
      embeddedAlbum{
        embedUrl,
        embedCode,
        title,
        artist,
        platform,
        releaseType,
        imageUrl,
        customImage,
        processedImageUrl,
        songs
      },
      customAlbum{
        title,
        artist,
        releaseType,
        customImage,
        songs
      }
    }`
    const resolvedAlbums = await getClient().fetch(query, { refs })
    console.log('Resolved albums:', resolvedAlbums)

    return {
      ...block,
      resolvedAlbums
    }
  }

  useEffect(() => {
    const resolveBlocks = async () => {
      setIsLoading(true)
      try {
        const resolvedBlocks = await Promise.all(
          contentBlocks.map(async block => {
            if (block._type === 'musicBlock') {
              return await resolveAlbumReferences(block)
            }
            return block
          })
        )
        setResolvedBlocks(resolvedBlocks)
      } catch (error) {
        console.error('Error resolving blocks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    resolveBlocks()
  }, [contentBlocks])

  // Add console logging to debug
  useEffect(() => {
    console.log('Resolved Blocks:', resolvedBlocks)
  }, [resolvedBlocks])

  const renderContentBlock = useCallback(
    (block: ContentBlock) => {
      switch (block._type) {
        case 'musicBlock':
          return (
            <ClientOnly>
              <section
                ref={refs.listenRef}
                key={block._key}
                id="listen-section"
                className="scroll-mt-20"
              >
                <MusicBlock
                  listenTitle={block.listenTitle}
                  albums={(block.resolvedAlbums || block.albums || []) as Album[]}
                />
              </section>
            </ClientOnly>
          )
        case 'videoBlock':
          return (
            <ClientOnly>
              <section
                ref={refs.lookRef}
                key={block._key}
                id="look-section"
                className="scroll-mt-20 relative z-20"
              >
                <VideoBlock
                  lookTitle={block.lookTitle}
                  heroVideoLink={block.heroVideoLink}
                  additionalVideos={block.additionalVideos}
                />
              </section>
            </ClientOnly>
          )
        case 'backgroundVideoBlock':
          return (
            <ClientOnly>
              <BackgroundVideoBlock key={block._key} {...block} />
            </ClientOnly>
          )
        case 'heroBanner':
          return <HeroBanner key={block._key} {...block} />
        case 'about':
          return (
            <About
              key={block._key}
              body={block.body}
              image={block.image}
              alignment={block.alignment}
            />
          )
        case 'newsletter':
          return (
            <Newsletter
              key={block._key}
              newsletter={block as NewsletterContent}
            />
          )
        default:
          console.warn(`Unknown block type: ${(block as any)._type}`)
          return null
      }
    },
    [refs]
  )

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p>Error loading content. Please try again later.</p>
        </div>
      }
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('HomeClient Error:', error, errorInfo)
        }
      }}
    >
      <main className="relative min-h-screen bg-black">
        <div className="relative z-10">
          {resolvedBlocks.map((block, index) => {
            switch (block._type) {
              case 'heroBanner':
                return <HeroBanner key={block._key} {...block} />

              case 'backgroundVideoBlock':
                const nextBlocks = resolvedBlocks.slice(index + 1)
                return (
                  <div key={`section-${block._key}`} className="relative z-20">
                    <BackgroundVideoBlock key={`bg-${block._key}`} {...block} />
                    <div className="relative z-30">
                      {nextBlocks.map((nextBlock) => {
                        if (nextBlock._type === 'videoBlock' || nextBlock._type === 'musicBlock') {
                          return (
                            <div key={`content-${nextBlock._key}`}>
                              {renderContentBlock(nextBlock)}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>
                )

              case 'about':
              case 'newsletter':
                return <div key={`content-${block._key}`}>{renderContentBlock(block)}</div>

              case 'videoBlock':
              case 'musicBlock':
                if (!resolvedBlocks.some(b => b._type === 'backgroundVideoBlock')) {
                  return <div key={`standalone-${block._key}`}>{renderContentBlock(block)}</div>
                }
                return null

              default:
                return null
            }
          })}
        </div>
      </main>
    </ErrorBoundary>
  )
}
