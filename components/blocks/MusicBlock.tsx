// components/blocks/MusicBlock.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import FlipCard from '@components/Music/FlipCard'
import Grid from '../../components/common/grid/Grid'
import { Album, Song, SanityImage } from '@types'
import { getClient, urlFor } from '@lib/sanity'
import { useNavbar } from '@context/NavbarContext'

interface MusicBlockProps {
  listenTitle: string
  description?: string
  albums?: Album[]
}

// Add this interface for processed albums
interface ProcessedAlbum {
  id: string
  embedUrl: string
  imageUrl: string
  title: string
  artist: string
  songs: Song[]
  albumSource: 'custom' | 'embedded'
}

const MusicBlock: React.FC<MusicBlockProps> = ({
  listenTitle,
  albums = [],
}) => {
  console.log('MusicBlock props:', { listenTitle, albums })

  const [flippedAlbums, setFlippedAlbums] = useState<Set<string>>(new Set())
  const flipCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [loadedAlbums, setLoadedAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (albums?.length) {
      setLoadedAlbums(albums)
    }
    setIsLoading(false)
  }, [albums])

  const handleFlip = useCallback((albumId: string) => {
    setFlippedAlbums((prev) => {
      const newFlipped = new Set(prev)
      if (newFlipped.has(albumId)) {
        newFlipped.delete(albumId)
      } else {
        newFlipped.add(albumId)
      }
      return newFlipped
    })
  }, [])

  const addFlipCardRef = useCallback(
    (albumId: string, ref: HTMLDivElement | null) => {
      if (ref) {
        flipCardRefs.current[albumId] = ref
      }
    },
    []
  )

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement

    // Check if click is inside any card or control
    const isInsideCard = target.closest(
      '.flip-back, .mobile-back, .flip-front, .mobile-front'
    )
    const isControl = target.closest(
      '.track-item, .player-control, .music-embed'
    )

    if (isInsideCard || isControl) {
      return // Don't close if clicking inside any card or control
    }

    // Only close if clicking completely outside
    setFlippedAlbums(new Set())
  }, [])

  useEffect(() => {
    if (flippedAlbums.size > 0) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }

    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [flippedAlbums.size, handleOutsideClick])

  const getSongs = (album: Album): Song[] => {
    if (album.albumSource === 'custom' && album.customAlbum?.songs) {
      return album.customAlbum.songs
    }
    return []
  }

  const getEmbedUrl = useCallback((album: Album): string => {
    if (!album.embeddedAlbum?.embedCode) return ''

    if (album.embeddedAlbum.platform === 'soundcloud' || album.embeddedAlbum.platform === 'spotify') {
      const match = album.embeddedAlbum.embedCode.match(/src="([^"]+)"/)
      return match ? match[1] : ''
    }

    return ''
  }, [])

  const getImageUrl = useCallback((album: Album): string => {
    if (!album) return '/images/placeholder.png'

    if (album.albumSource === 'embedded' && album.embeddedAlbum) {
      const customImageUrl = album.embeddedAlbum.customImage?.asset
        ? urlFor(album.embeddedAlbum.customImage)?.toString() || ''
        : ''

      return (
        album.embeddedAlbum.processedImageUrl ||
        album.embeddedAlbum.imageUrl ||
        customImageUrl ||
        '/images/placeholder.png'
      )
    }

    if (album.customAlbum?.customImage?.asset) {
      return (
        urlFor(album.customAlbum.customImage)?.toString() ||
        '/images/placeholder.png'
      )
    }

    return '/images/placeholder.png'
  }, [])

  // Memoize album processing
  const processedAlbums = useMemo(
    () =>
      loadedAlbums?.map((album: Album) => ({
        id: album._id,
        embedUrl: getEmbedUrl(album),
        imageUrl: getImageUrl(album),
        title: album.embeddedAlbum?.title || album.customAlbum?.title || 'Untitled Album',
        artist: album.embeddedAlbum?.artist || album.customAlbum?.artist || 'Unknown Artist',
        songs: getSongs(album),
        albumSource: album.albumSource,
      })) || [],
    [loadedAlbums, getEmbedUrl, getImageUrl, getSongs]
  )

  if (isLoading) {
    return <div>Loading albums...</div>
  }

  if (!loadedAlbums?.length) {
    return <div>No albums available</div>
  }

  // Create a URL-safe ID by removing spaces and special characters
  const sectionId = (listenTitle || 'listen').replace(/[^a-zA-Z0-9]/g, '')

  return (
    <section
      id="listen-section"
      className="relative z-10 w-full py-16"
      data-section-type="listen"
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <h2 className="mb-16 text-center text-6xl font-Headline bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 text-transparent font-bold">
          {listenTitle}
        </h2>

        <Grid columns={1} gap={32} className="w-full max-w-6xl mx-auto pb-32">
          {processedAlbums.map((album, index) => {
            if (!album) return null

            const albumId = album.id || `album-${index}`

            return (
              <div
                key={albumId}
                className="flex justify-center items-center w-full p-4 mx-auto"
              >
                <FlipCard
                  album={{
                    albumId,
                    title: album.title,
                    artist: album.artist,
                    imageUrl: album.imageUrl,
                    songs: album.songs,
                    embedUrl: album.embedUrl,
                    albumSource: album.albumSource,
                  }}
                  isFlipped={flippedAlbums.has(albumId)}
                  toggleFlip={handleFlip}
                  addFlipCardRef={addFlipCardRef}
                  titleClass="text-xl md:text-2xl lg:text-3xl whitespace-nowrap truncate"
                  artistClass="text-lg md:text-xl lg:text-2xl whitespace-nowrap truncate"
                />
              </div>
            )
          })}
        </Grid>
      </div>
    </section>
  )
}

export default MusicBlock
