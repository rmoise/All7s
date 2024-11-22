'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { Howl } from 'howler'
import { throttle } from 'lodash'

interface Song {
  trackTitle: string
  url: string
  duration: number
}

interface EmbeddedAlbum {
  embedUrl?: string
  title: string
  artist: string
  platform?: string
  releaseType: string
  imageUrl: string
  customImage?: {
    asset: {
      url: string
    }
  }
  songs?: Song[]
}

interface AudioContextType {
  currentHowl: Howl | null
  currentAlbumId: string | null
  currentTrackIndex: number | null
  isPlaying: boolean
  currentTime: number
  playTrack: (url: string, albumId: string, trackIndex?: number) => void
  pauseTrack: () => void
  stopTrack: () => void
  seekTo: (seekTime: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

interface AudioProviderProps {
  children: ReactNode
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [currentHowl, setCurrentHowl] = useState<Howl | null>(null)
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(
    null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    let rafId: number

    const update = () => {
      if (currentHowl && currentHowl.playing()) {
        const seek = currentHowl.seek()
        setCurrentTime(typeof seek === 'number' ? seek : 0)
        rafId = requestAnimationFrame(update)
      }
    }

    if (currentHowl && currentHowl.playing()) {
      rafId = requestAnimationFrame(update)
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [currentHowl, isPlaying])

  const playTrack = useCallback(
    (url: string, albumId: string, trackIndex = 0) => {
      if (
        currentHowl &&
        currentAlbumId === albumId &&
        currentTrackIndex === trackIndex
      ) {
        if (!isPlaying) {
          currentHowl.play()
          setIsPlaying(true)
        }
        return
      }

      if (currentHowl) {
        currentHowl.stop()
      }

      const newHowl = new Howl({
        src: [url],
        html5: true,
        preload: false,
        onplay: () => {
          setIsPlaying(true)
          setCurrentAlbumId(albumId)
          setCurrentTrackIndex(trackIndex)
        },
        onpause: () => setIsPlaying(false),
        onstop: resetAudioState,
        onend: resetAudioState,
        onloaderror: (id: number, error: { message: string }) =>
          console.error(`Error loading track: ${error.message}`),
        onplayerror: (id: number, error: { message: string }) => {
          console.error(`Error playing track: ${error.message}`)
          newHowl.once('unlock', () => newHowl.play())
        },
      })

      setCurrentHowl(newHowl)
      newHowl.play()
    },
    [currentHowl, currentAlbumId, currentTrackIndex, isPlaying]
  )

  const resetAudioState = useCallback(() => {
    setIsPlaying(false)
    setCurrentAlbumId(null)
    setCurrentTime(0)
    setCurrentTrackIndex(null)
  }, [])

  const pauseTrack = useCallback(() => {
    if (currentHowl && currentHowl.playing()) {
      currentHowl.pause()
      setIsPlaying(false)
    }
  }, [currentHowl])

  const throttledSeekTo = useMemo(
    () =>
      throttle((seekTime: number) => {
        if (currentHowl && typeof seekTime === 'number') {
          currentHowl.seek(seekTime)
          setCurrentTime(seekTime)
        }
      }, 100),
    [currentHowl]
  )

  const stopTrack = useCallback(() => {
    if (currentHowl) {
      currentHowl.stop()
      setCurrentHowl(null)
      setCurrentAlbumId(null)
      setIsPlaying(false)
      setCurrentTime(0)
      setCurrentTrackIndex(null)
    }
  }, [currentHowl])

  useEffect(() => {
    return () => {
      if (currentHowl) {
        currentHowl.unload()
      }
    }
  }, [currentHowl])

  const value = useMemo(
    () => ({
      currentHowl,
      currentAlbumId,
      currentTrackIndex,
      isPlaying,
      currentTime,
      playTrack,
      pauseTrack,
      stopTrack,
      seekTo: throttledSeekTo,
    }),
    [
      currentHowl,
      currentAlbumId,
      currentTrackIndex,
      isPlaying,
      currentTime,
      playTrack,
      pauseTrack,
      stopTrack,
      throttledSeekTo,
    ]
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

// Custom hook for easy access
export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
