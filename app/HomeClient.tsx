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
import { Album, MusicAlbum } from '@types'
import { groq } from 'next-sanity'

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
  resolvedAlbums?: MusicAlbum[]
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

interface SanityAlbum {
  _id: string
  _type: 'album'
  albumSource: 'custom' | 'embedded'
  customAlbum?: {
    title: string
    artist: string
    releaseType: string
    image?: {
      asset: {
        _ref: string
        url: string
      }
    }
    songs: any[]
  }
  embeddedAlbum?: {
    platform: 'spotify' | 'soundcloud' | 'other'
    embedCode: string
    title: string
    artist: string
    embedUrl: string
    imageUrl: string
    processedImageUrl?: string
    releaseType: string
    customImage?: {
      asset: {
        _ref: string
        url: string
      }
    }
    songs: any[]
  }
}

interface AlbumReference {
  _ref: string
  _type: 'reference'
  _key: string
  _id?: string
}

export default function HomeClient({ contentBlocks }: HomeClientProps) {
  const { refs } = useNavbar()
  const [resolvedBlocks, setResolvedBlocks] = useState<ContentBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const newsletterBlock = contentBlocks.find(
    (block) => block._type === 'newsletter'
  ) as NewsletterContent

  const handleError = (error: Error, context: string) => {
    setError(error)
    if (process.env.NODE_ENV === 'development') {
      throw error
    }
  }

  const generateSafeKey = (prefix: string, value: string | undefined) => {
    if (!value) {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    return `${prefix}_${value.replace(/[^a-zA-Z0-9_-]/g, '_')}`
  }

  const resolveAlbumReferences = async (
    block: MusicBlockContent
  ): Promise<MusicBlockContent> => {
    try {
      if (!block || block._type !== 'musicBlock') {
        return block
      }

      if (!block.albums?.length) {
        return block
      }

      const refOrderMap = new Map(
        block.albums.map((album, index) => [album._ref, index])
      )

      const refs = block.albums
        .filter((album) => Boolean(album && album._ref))
        .map((album) => album._ref)

      if (!refs.length) {
        return block
      }

      const query = `*[_type == "album" && _id in $refs]{
        _id,
        _type,
        albumSource,
        customAlbum {
          title,
          artist,
          releaseType,
          image {
            asset {
              _ref,
              url
            }
          },
          songs[]
        },
        embeddedAlbum {
          platform,
          embedCode,
          title,
          artist,
          embedUrl,
          imageUrl,
          processedImageUrl,
          releaseType,
          customImage {
            asset {
              _ref,
              url
            }
          },
          songs[]
        }
      }`

      const resolvedAlbums = await getClient().fetch<SanityAlbum[]>(query, {
        refs,
      })

      if (!resolvedAlbums?.length) {
        return block
      }

      const musicAlbums = resolvedAlbums
        .filter((album): album is SanityAlbum => Boolean(album && album._id))
        .sort((a, b) => {
          const orderA = refOrderMap.get(a._id) ?? Number.MAX_VALUE
          const orderB = refOrderMap.get(b._id) ?? Number.MAX_VALUE
          return orderA - orderB
        })
        .map((album) => ({
          _type: 'album' as const,
          _id: album._id,
          albumSource: album.albumSource,
          title:
            album.albumSource === 'custom'
              ? album.customAlbum?.title || 'Untitled Album'
              : album.embeddedAlbum?.title || 'Untitled Album',
          albumId: album._id,
          customAlbum: album.customAlbum && {
            ...album.customAlbum,
            customImage: album.customAlbum.image
              ? {
                  asset: album.customAlbum.image.asset,
                }
              : undefined,
          },
          embeddedAlbum: album.embeddedAlbum && {
            ...album.embeddedAlbum,
            platform: album.embeddedAlbum.platform,
            songs: album.embeddedAlbum.songs || [],
          },
        }))

      return {
        ...block,
        resolvedAlbums: musicAlbums,
      }
    } catch (error) {
      handleError(error as Error, 'resolveAlbumReferences')
      return block
    }
  }

  useEffect(() => {
    const resolveBlocks = async () => {
      try {
        if (!contentBlocks?.length) {
          return
        }

        const resolvedBlocks = await Promise.all(
          contentBlocks.map(async (block, index) => {
            try {
              const blockKey = block._key || `block_${index}`
              const safeKey = generateSafeKey('block', blockKey)

              if (block._type === 'musicBlock') {
                const validAlbums = (block.albums || []).reduce(
                  (acc: AlbumReference[], album: any) => {
                    if (!album) return acc

                    const hasValidRef = Boolean(album._id || album._ref)
                    if (!hasValidRef) return acc

                    const ref = album._ref || album._id
                    const key = album._key || ref

                    acc.push({
                      _ref: ref,
                      _type: 'reference' as const,
                      _key: generateSafeKey('album', key),
                      _id: album._id,
                    })

                    return acc
                  },
                  []
                )

                if (!validAlbums.length) {
                  return { ...block, _key: safeKey }
                }

                const updatedBlock: MusicBlockContent = {
                  ...block,
                  _key: safeKey,
                  albums: validAlbums,
                }

                const resolvedBlock = await resolveAlbumReferences(updatedBlock)
                return resolvedBlock
              }

              return { ...block, _key: safeKey }
            } catch (blockError) {
              handleError(blockError as Error, 'processBlock')
              return {
                ...block,
                _key: generateSafeKey('block', `${index}_error`),
              }
            }
          })
        )

        const validBlocks = resolvedBlocks.filter(Boolean)
        setResolvedBlocks(validBlocks)
      } catch (error) {
        handleError(error as Error, 'resolveBlocks')
        setResolvedBlocks([])
      }
    }

    resolveBlocks()
  }, [contentBlocks])

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
                className="scroll-mt-20 relative z-20"
              >
                <MusicBlock
                  listenTitle={block.listenTitle}
                  description={block.description}
                  albums={block.resolvedAlbums || []}
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
          return null
      }
    },
    [refs]
  )

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p>{error?.message || 'Error loading content. Please try again later.'}</p>
        </div>
      }
      onError={(error, errorInfo) => {
        handleError(error, 'HomeClient')
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
                        if (
                          nextBlock._type === 'videoBlock' ||
                          nextBlock._type === 'musicBlock'
                        ) {
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
                return (
                  <div key={`content-${block._key}`}>
                    {renderContentBlock(block)}
                  </div>
                )

              case 'videoBlock':
              case 'musicBlock':
                if (
                  !resolvedBlocks.some(
                    (b) => b._type === 'backgroundVideoBlock'
                  )
                ) {
                  return (
                    <div
                      key={`standalone-${block._key}`}
                      className="relative z-20"
                    >
                      {renderContentBlock(block)}
                    </div>
                  )
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
