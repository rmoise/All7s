// components/Music/FlipCard.tsx

import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import anime from 'animejs'
import { useAudio } from '@/context/AudioContext' // Adjust the path as needed
import MusicEmbed from '@components/MusicEmbed' // Ensure correct path
import { debounce } from 'lodash'
import Image from 'next/image'
import type { Song } from '@/types/sanity';
import type { SanityRawSong } from '@/types/sanity';

interface CustomImage {
  asset: {
    url: string
  }
}

interface Album {
  albumId: string;
  title: string;
  artist?: string;
  embedUrl?: string;
  songs?: Song[];
  albumSource: 'embedded' | 'custom';
  imageUrl?: string;
  customImage?: CustomImage;
}

interface FlipCardAlbum {
  albumId: string;
  title: string;
  artist?: string;
  albumSource: 'embedded' | 'custom';
  songs?: Song[];
  embedUrl?: string;
  imageUrl?: string;
  customImage?: {
    asset: {
      url: string;
    };
  };
  embeddedAlbum?: {
    songs?: Song[];
    embedUrl: string;
    title: string;
    artist: string;
    platform: 'spotify' | 'soundcloud';
    releaseType: string;
    imageUrl?: string;
    processedImageUrl: string;
    customImage?: {
      asset: {
        url: string;
      };
    };
  };
  customAlbum?: {
    title: string;
    artist: string;
    releaseType: string;
    customImage?: {
      asset: {
        url: string;
      };
    };
    songs: Song[];
  };
}

// Define the FlipCardProps interface
interface FlipCardProps {
  album: {
    albumId: string;
    title: string;
    artist?: string;
    embedUrl?: string;
    imageUrl?: string;
    customImage?: {
      asset: {
        url: string;
      };
    };
    albumSource: 'embedded' | 'custom';
    songs?: Song[];
    customAlbum?: {
      songs: Song[];
      title: string;
      artist: string;
    };
    embeddedAlbum?: {
      songs?: Song[];
      embedUrl: string;
      title: string;
      artist: string;
      platform: 'spotify' | 'soundcloud';
      releaseType: string;
      imageUrl?: string;
      processedImageUrl: string;
    };
  };
  isFlipped: boolean;
  toggleFlip: (albumId: string) => void;
  addFlipCardRef: (albumId: string, ref: HTMLDivElement | null) => void;
  titleClass?: string;
  artistClass?: string;
}

interface SanityFileAsset {
  _type: 'file';
  asset: {
    _ref: string;
    _type: 'reference';
  } | {
    url: string;
  };
}

// Helper function to get URL from any song format
function getSongUrl(song: SanityRawSong | Song): string | undefined {
  console.log('Getting URL for song:', JSON.stringify(song, null, 2));

  // For Sanity file-based songs
  if (song.file?.asset) {
    // Check for direct URL first
    if ('url' in song.file.asset && song.file.asset.url) {
      console.log('Found direct URL:', song.file.asset.url);
      return song.file.asset.url;
    }

    // Then check for _ref
    if ('_ref' in song.file.asset && song.file.asset._ref) {
      const ref = song.file.asset._ref;
      const [_file, id, extension] = ref.split('-');
      const fileUrl = `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${id}.${extension}`;
      console.log('Constructed file URL:', fileUrl);
      return fileUrl;
    }
  }

  // For direct URL songs
  if ('url' in song && song.url) {
    console.log('Found direct URL:', song.url);
    return song.url;
  }

  console.log('No URL found for song:', song);
  return undefined;
}

const FlipCard = forwardRef<HTMLDivElement, FlipCardProps>(
  ({ album, isFlipped, toggleFlip, addFlipCardRef, titleClass, artistClass }, ref) => {
    const imgRef = useRef<HTMLImageElement>(null)
    const {
      currentHowl,
      currentAlbumId,
      currentTrackIndex,
      isPlaying,
      currentTime,
      playTrack,
      pauseTrack,
      seekTo,
    } = useAudio()

    const [currentTrackIndexLocal, setCurrentTrackIndexLocal] = useState<
      number | null
    >(null)
    const [songDurations, setSongDurations] = useState<Record<number, number>>(
      {}
    )
    const [isMobile, setIsMobile] = useState(false)

    // Handle window resize to set isMobile
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768)
      // Only run on client side
      if (typeof window !== 'undefined') {
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
      }
    }, [])

    // Derived variables to handle data structures
    const songs = useMemo(() => {
      if (album.albumSource === 'custom' && album.customAlbum?.songs) {
        return album.customAlbum.songs;
      }
      if (album.embeddedAlbum?.songs) {
        return album.embeddedAlbum.songs;
      }
      return album.songs || [] as Song[];
    }, [album]);
    const embedUrl = album.embedUrl || album.embeddedAlbum?.embedUrl || '';

    const imageUrl = useMemo(() => {
      return (
        album.customImage?.asset?.url ||
        album.imageUrl ||
        album.embeddedAlbum?.imageUrl ||
        album.embeddedAlbum?.processedImageUrl ||
        '/images/placeholder.png'
      );
    }, [album]);

    // Determine the platform based on the embedUrl
    const platform = useMemo(() => {
      if (!embedUrl) return null;
      const url = embedUrl.toLowerCase();
      if (url.includes('spotify.com')) return 'spotify';
      if (url.includes('soundcloud.com') || url.includes('api.soundcloud.com')) return 'soundcloud';
      console.log('No platform detected for URL:', url); // Add debugging
      return null;
    }, [embedUrl]);

    // Logging for debugging
    useEffect(() => {
      console.log('Album Data:', album)
      console.log('Embed URL:', embedUrl)
      console.log('Platform:', platform)
      console.log('Image URL:', imageUrl)
    }, [album, embedUrl, platform, imageUrl])

    // Determine if the current track is playing or paused
    const isThisTrackPlaying = useMemo(
      () =>
        isPlaying &&
        currentAlbumId === album.albumId &&
        currentTrackIndex === currentTrackIndexLocal,
      [
        isPlaying,
        currentAlbumId,
        album.albumId,
        currentTrackIndex,
        currentTrackIndexLocal,
      ]
    )

    const isThisTrackPaused = useMemo(
      () =>
        !isPlaying &&
        currentAlbumId === album.albumId &&
        currentTrackIndex === currentTrackIndexLocal,
      [
        isPlaying,
        currentAlbumId,
        album.albumId,
        currentTrackIndex,
        currentTrackIndexLocal,
      ]
    )

    // Handle clicking on a track to play
    const handleTrackClick = useCallback(
      (e: React.MouseEvent, idx: number) => {
        e.stopPropagation();
        console.log('Track clicked:', { idx, song: songs[idx] });

        if (songs && idx >= 0 && idx < songs.length) {
          const selectedTrack = songs[idx];
          const trackUrl = getSongUrl(selectedTrack);

          console.log('Track URL:', trackUrl);

          if (trackUrl) {
            setCurrentTrackIndexLocal(idx);
            playTrack(trackUrl, album.albumId, idx);
          } else {
            console.warn('No valid URL found for track:', selectedTrack);
          }
        }
      },
      [songs, playTrack, album.albumId]
    );

    // Handle play/pause button click
    const handlePlayPause = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('Play/Pause clicked:', {
          currentTrackIndexLocal,
          songs,
          isThisTrackPlaying,
          isThisTrackPaused
        });

        if (currentTrackIndexLocal === null) {
          if (songs && songs.length > 0) {
            const firstTrack = songs[0];
            console.log('Playing first track:', firstTrack);

            // Use getSongUrl helper instead of direct property access
            const trackUrl = getSongUrl(firstTrack);
            console.log('Track URL:', trackUrl);

            if (trackUrl) {
              setCurrentTrackIndexLocal(0);
              playTrack(trackUrl, album.albumId, 0);
            } else {
              console.warn('Track URL is missing:', firstTrack);
            }
          }
          return;
        }

        if (isThisTrackPlaying) {
          pauseTrack();
        } else if (isThisTrackPaused) {
          currentHowl?.play();
        } else {
          const currentSong = songs[currentTrackIndexLocal];
          // Use getSongUrl helper here as well
          const trackUrl = getSongUrl(currentSong);

          if (trackUrl) {
            playTrack(trackUrl, album.albumId, currentTrackIndexLocal);
          } else {
            console.warn('No valid URL found for track:', currentSong);
          }
        }
      },
      [
        currentTrackIndexLocal,
        songs,
        isThisTrackPlaying,
        isThisTrackPaused,
        pauseTrack,
        currentHowl,
        playTrack,
        album.albumId
      ]
    );

    // Set song durations when album changes
    useEffect(() => {
      if (songs && songs.length > 0) {
        const durations: Record<number, number> = {}
        songs.forEach((song, idx) => {
          durations[idx] = song.duration || 0
        })
        setSongDurations(durations)
      } else {
        setSongDurations({})
      }
    }, [songs])

    // Debounced seek function
    const debouncedHandleSeek = useMemo(
      () =>
        debounce((seekTime: number) => {
          if (
            (isThisTrackPlaying || isThisTrackPaused) &&
            currentTrackIndexLocal !== null &&
            songDurations[currentTrackIndexLocal] > 0
          ) {
            seekTo(seekTime)
          }
        }, 300),
      [
        isThisTrackPlaying,
        isThisTrackPaused,
        currentTrackIndexLocal,
        songDurations,
        seekTo,
      ]
    )

    // Handle seek input change
    const handleSeek = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (currentTrackIndexLocal === null || !songDurations[currentTrackIndexLocal]) {
          return;
        }

        const seekPercent = Number(e.target.value);
        const duration = songDurations[currentTrackIndexLocal];
        const seekTime = (seekPercent / 100) * duration;

        console.log('Seeking to:', {
          seekTime,
          duration,
          percent: seekPercent,
          currentTrack: currentTrackIndexLocal
        });

        debouncedHandleSeek(seekTime);
      },
      [currentTrackIndexLocal, songDurations, debouncedHandleSeek]
    );

    // Format time in mm:ss
    const formatTime = (time: number | null) => {
      if (time === null || isNaN(time)) return '00:00'
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    // Animate the image scaling on flip
    useEffect(() => {
      if (!isMobile) {
        anime({
          targets: imgRef.current,
          scale: isFlipped ? 0.8 : 1,
          borderColor: isFlipped
            ? 'rgba(255, 0, 0, 0.5)'
            : 'rgba(0, 0, 0, 0.5)',
          borderWidth: '8px',
          duration: 300,
          easing: 'easeOutQuad',
        })
      }
    }, [isFlipped, isMobile])

    // Sync current track index with global audio state
    useEffect(() => {
      if (isPlaying && currentAlbumId === album.albumId) {
        const currentSrc = currentHowl?._src?.[0]
          ? currentHowl._src[0].toLowerCase()
          : ''
        const trackIdx = songs.findIndex(
          (song) => song.url?.toLowerCase() === currentSrc
        )
        if (trackIdx !== -1 && trackIdx !== currentTrackIndexLocal) {
          setCurrentTrackIndexLocal(trackIdx)
        }
      }
    }, [currentHowl, isPlaying, album, songs, currentTrackIndexLocal])

    // Render the list of tracks
    const renderTrackList = useMemo(() => {
      return songs.map((song: Song, idx: number) => (
        <div
          key={'_key' in song ? song._key : `track-${idx}`}
          className={clsx(
            'track-item flex justify-between items-center cursor-pointer hover:bg-gray-300 rounded-md p-3',
            {
              'bg-gray-400':
                currentTrackIndexLocal === idx &&
                (isThisTrackPlaying || isThisTrackPaused),
            }
          )}
          onClick={(e) => handleTrackClick(e, idx)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-black">
              {song.trackTitle}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {songDurations[idx] ? formatTime(songDurations[idx]) : '--:--'}
          </span>
        </div>
      ));
    }, [songs, currentTrackIndexLocal, isThisTrackPlaying, isThisTrackPaused, songDurations, handleTrackClick]);

    // Handle mouse enter for non-mobile and not flipped
    const handleMouseEnter = useCallback(() => {
      if (!isMobile && !isFlipped) {
        anime({
          targets: imgRef.current,
          scale: 0.9,
          borderColor: 'rgba(255, 0, 0, 0.5)',
          borderWidth: '8px',
          duration: 300,
          easing: 'easeOutQuad',
        })
      }
    }, [isMobile, isFlipped])

    // Handle mouse leave for non-mobile and not flipped
    const handleMouseLeave = useCallback(() => {
      if (!isMobile && !isFlipped) {
        anime({
          targets: imgRef.current,
          scale: 1,
          borderColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: '8px',
          duration: 300,
          easing: 'easeOutQuad',
        })
      }
    }, [isMobile, isFlipped])

    // Prevent propagation when clicking on content
    const handleContentClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }, [])

    // Define the handleFlip function
    const handleFlip = useCallback(() => {
      toggleFlip(album.albumId)
    }, [toggleFlip, album.albumId])

    return (
      <div
        ref={ref}
        className="relative w-full mb-8 px-4 sm:px-0"
        data-album-id={album.albumId}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">
          {album.title || 'Untitled Album'}
        </h2>

        <div className="relative max-w-lg mx-auto">
          <div
            className={`w-full ${
              isMobile ? 'mobile-container' : 'flip-container'
            } ${isFlipped ? (isMobile ? 'mobile-expanded' : 'flipped') : ''}`}
          >
            {/* Front of the card */}
            <div
              className={`${
                isMobile ? 'mobile-front' : 'flip-front absolute inset-0'
              } bg-black/0 rounded-lg ${isMobile ? '' : 'backface-hidden'}`}
              onClick={handleFlip}
            >
              <div
                className="w-full cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-full h-0 pb-[100%] relative">
                  <Image
                    ref={imgRef}
                    src={imageUrl}
                    alt={album.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    quality={100}
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    priority
                  />
                </div>
              </div>
              {/* Optional Flip Icon for Non-Embedded Albums */}
              {album.albumSource !== 'embedded' && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  <FontAwesomeIcon
                    icon={faSyncAlt}
                    className="text-white opacity-50"
                  />
                </div>
              )}
            </div>

            {/* Back of the card */}
            <div
              className={`${
                isMobile ? 'mobile-back' : 'flip-back absolute inset-0'
              } rounded-lg ${
                isMobile ? '' : 'backface-hidden overflow-hidden'
              }`}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <div
                className="w-full h-full"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {songs && songs.length > 0 ? (
                  <div
                    className="custom-player md:h-[500px] bg-white w-full p-4 rounded-lg"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    {/* Player UI */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Image
                        src={imageUrl}
                        alt={album.title}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                        priority
                      />
                      <div>
                        <p className="text-xl font-semibold text-black">
                          {album.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {album.artist || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    {/* Play/Pause Button */}
                    <div className="flex justify-center items-center mt-4">
                      <button
                        className="text-black bg-gray-300 hover:bg-gray-400 rounded-full p-4"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlayPause(e);
                        }}
                        aria-label={isThisTrackPlaying ? 'Pause Track' : 'Play Track'}
                        style={{
                          backgroundColor: isThisTrackPlaying ? '#ff4d4d' : '#4CAF50',
                          width: '60px',
                          height: '60px',
                          fontSize: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isThisTrackPlaying ? (
                          <FontAwesomeIcon icon={faPause} />
                        ) : (
                          <FontAwesomeIcon icon={faPlay} />
                        )}
                      </button>
                    </div>

                    {/* Seek Bar */}
                    <div className="mt-4 w-full">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          currentTrackIndexLocal !== null &&
                          songDurations[currentTrackIndexLocal] > 0
                            ? (currentTime /
                                songDurations[currentTrackIndexLocal]) *
                              100
                            : 0
                        }
                        className="w-full"
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSeek(e)
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          {currentTrackIndexLocal !== null &&
                          (isThisTrackPlaying || currentTime > 0)
                            ? formatTime(currentTime)
                            : '00:00'}
                        </span>
                        <span>
                          {currentTrackIndexLocal !== null &&
                          songDurations[currentTrackIndexLocal] > 0
                            ? formatTime(songDurations[currentTrackIndexLocal])
                            : '00:00'}
                        </span>
                      </div>
                    </div>

                    {/* Track List */}
                    <div className="mt-4 w-full max-h-60 overflow-y-auto custom-scrollbar">
                      {renderTrackList}
                    </div>
                  </div>
                ) : (
                  // Only show embed if there are no songs AND there's an embed URL
                  <div className="music-embed h-full">
                    {embedUrl && platform ? (
                      <MusicEmbed
                        embedUrl={embedUrl}
                        title={album.title}
                        platform={platform as 'spotify' | 'soundcloud'}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-center">
                          No music available for this album.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Component Styles */}
        <style jsx>{`
          .flip-container {
            perspective: 1000px;
            transform-style: preserve-3d;
            position: relative;
            width: 100%;
            height: 100%;
          }

          .flip-front,
          .flip-back {
            backface-visibility: hidden;
            transition: transform 0.6s;
          }

          .flip-front {
            transform: rotateY(0deg);
            z-index: 2;
          }

          .flip-back {
            transform: rotateY(180deg);
            z-index: 1;
          }

          .flipped .flip-front {
            transform: rotateY(180deg);
            z-index: 1;
          }

          .flipped .flip-back {
            transform: rotateY(360deg);
            z-index: 2;
          }

          .backface-hidden {
            backface-visibility: hidden;
          }

          /* Mobile Specific Styles */
          @media (max-width: 768px) {
            .mobile-container {
              transition: max-height 0.6s ease-in-out;
              max-height: 500px;
              overflow: hidden;
            }

            .mobile-front,
            .mobile-back {
              transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
            }

            .mobile-back {
              opacity: 0;
              visibility: hidden;
              height: 0;
            }

            .mobile-expanded {
              max-height: 1000px;
            }

            .mobile-expanded .mobile-front {
              opacity: 0;
              visibility: hidden;
              height: 0;
            }

            .mobile-expanded .mobile-back {
              opacity: 1;
              visibility: visible;
              height: auto;
            }

            .custom-player {
              background-color: white;
            }

            .music-embed {
              background-color: transparent;
            }
          }

          /* Desktop Specific Styles */
          @media (min-width: 769px) {
            .flip-container {
              width: 100%;
              padding-bottom: 100%; /* Square aspect ratio */
            }

            .flip-front,
            .flip-back {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
            }
          }

          /* Ensure the iframe container occupies the full available space */
          .music-embed-container {
            width: 100%;
            height: 352px;
            position: relative;
          }

          .music-embed iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 12px;
            opacity: 0;
            transition: opacity 0.3s ease-in;
          }

          .music-embed iframe.loaded {
            opacity: 1;
          }
        `}</style>
      </div>
    )
  }
)

FlipCard.displayName = 'FlipCard';

export default FlipCard
