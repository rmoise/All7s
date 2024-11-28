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

  const newsletterBlock = contentBlocks.find(
    (block) => block._type === 'newsletter'
  ) as NewsletterContent

  console.log('Newsletter in HomeClient:', {
    block: newsletterBlock,
    hasNotification: !!newsletterBlock?.notification,
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
      console.log('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET
      });

      if (!block || block._type !== 'musicBlock') {
        console.log('Invalid block type:', block)
        return block
      }

      if (!block.albums?.length) {
        console.log('No albums to resolve:', block)
        return block
      }

      // Create a map of refs to their original order
      const refOrderMap = new Map(
        block.albums.map((album, index) => [album._ref, index])
      )

      const refs = block.albums
        .filter((album) => Boolean(album && album._ref))
        .map((album) => album._ref)

      console.log('Album refs to resolve:', refs)

      if (!refs.length) {
        console.log('No valid refs to resolve')
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
      console.log('Raw resolved albums:', resolvedAlbums)

      if (!resolvedAlbums?.length) {
        console.warn('No albums found for refs:', refs)
        return block
      }

      // Sort the resolved albums based on their original order
      const musicAlbums = resolvedAlbums
        .filter((album): album is SanityAlbum => Boolean(album && album._id))
        .sort((a, b) => {
          const orderA = refOrderMap.get(a._id) ?? Number.MAX_VALUE
          const orderB = refOrderMap.get(b._id) ?? Number.MAX_VALUE
          return orderA - orderB
        })
        .map((album) => {
          const transformed = {
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
              customImage: album.customAlbum.image ? {
                asset: album.customAlbum.image.asset
              } : undefined
            },
            embeddedAlbum: album.embeddedAlbum && {
              ...album.embeddedAlbum,
              platform: album.embeddedAlbum.platform,
              songs: album.embeddedAlbum.songs || [],
            },
          }
          console.log('Transformed album:', transformed)
          return transformed
        })

      return {
        ...block,
        resolvedAlbums: musicAlbums,
      }
    } catch (error) {
      console.error('Error in resolveAlbumReferences:', error)
      if (process.env.NODE_ENV === 'production') {
        console.error('Full error details:', {
          error,
          block,
          env: process.env.NEXT_PUBLIC_ENVIRONMENT
        })
      }
      return block
    }
  }

  useEffect(() => {
    const resolveBlocks = async () => {
      try {
        if (!contentBlocks?.length) {
          console.log('No content blocks to process')
          return
        }

        const resolvedBlocks = await Promise.all(
          contentBlocks.map(async (block, index) => {
            try {
              const blockKey = block._key || `block_${index}`
              const safeKey = generateSafeKey('block', blockKey)

              if (block._type === 'musicBlock') {
                console.log('Raw music block:', {
                  block,
                  albumsData: block.albums,
                  albumsLength: block.albums?.length,
                })

                // Validate and transform albums array
                const validAlbums = (block.albums || []).reduce(
                  (acc: AlbumReference[], album: any) => {
                    if (!album) {
                      console.warn('Skipping null/undefined album')
                      return acc
                    }

                    console.log('Processing raw album:', album)

                    const hasValidRef = Boolean(album._id || album._ref)
                    if (!hasValidRef) {
                      console.warn('Album missing _id and _ref:', album)
                      return acc
                    }

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

                console.log('Processed valid albums:', validAlbums)

                if (!validAlbums.length) {
                  console.warn('No valid albums found after processing')
                  return { ...block, _key: safeKey }
                }

                const updatedBlock: MusicBlockContent = {
                  ...block,
                  _key: safeKey,
                  albums: validAlbums,
                }

                console.log(
                  'Sending block to resolveAlbumReferences:',
                  updatedBlock
                )
                const resolvedBlock = await resolveAlbumReferences(updatedBlock)
                console.log('Received resolved block:', resolvedBlock)
                return resolvedBlock
              }

              return { ...block, _key: safeKey }
            } catch (blockError) {
              console.error('Error processing block:', blockError)
              return {
                ...block,
                _key: generateSafeKey('block', `${index}_error`),
              }
            }
          })
        )

        // Filter out any null or undefined blocks
        const validBlocks = resolvedBlocks.filter(Boolean)
        console.log('Final resolved blocks:', validBlocks)
        setResolvedBlocks(validBlocks)
      } catch (error) {
        console.error('Error in resolveBlocks:', error)
        setResolvedBlocks([])
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
          console.log('Rendering music block:', {
            block,
            hasAlbums: block.albums?.length > 0,
            albumRefs: block.albums?.map((a) => a._ref),
            resolvedAlbums: block.resolvedAlbums,
          })

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
        console.error('HomeClient Error:', error, errorInfo)
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
