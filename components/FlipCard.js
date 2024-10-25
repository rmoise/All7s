// components/FlipCard.js

import React, { forwardRef, useRef, useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import anime from 'animejs';
import { useAudio } from '../context/AudioContext.jsx';
import SpotifyEmbed from './SpotifyEmbed';
import { debounce } from 'lodash';
import Image from 'next/image';

const FlipCard = forwardRef(({ album, isFlipped, toggleFlip }, ref) => {
  const imgRef = useRef(null);
  const {
    currentHowl,
    currentAlbumId,
    currentTrackIndex,
    isPlaying,
    currentTime,
    playTrack,
    pauseTrack,
    seekTo,
  } = useAudio();

  const [currentTrackIndexLocal, setCurrentTrackIndexLocal] = useState(null);
  const [songDurations, setSongDurations] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to set isMobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if the current track is playing or paused
  const isThisTrackPlaying = useMemo(
    () =>
      isPlaying &&
      currentAlbumId === album.albumId &&
      currentTrackIndex === currentTrackIndexLocal,
    [isPlaying, currentAlbumId, album.albumId, currentTrackIndex, currentTrackIndexLocal]
  );

  const isThisTrackPaused = useMemo(
    () =>
      !isPlaying &&
      currentAlbumId === album.albumId &&
      currentTrackIndex === currentTrackIndexLocal,
    [isPlaying, currentAlbumId, album.albumId, currentTrackIndex, currentTrackIndexLocal]
  );

  // Handle clicking on a track to play
  const handleTrackClick = useCallback(
    (e, idx) => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      if (album.songs && idx >= 0 && idx < album.songs.length) {
        setCurrentTrackIndexLocal(idx);
        const selectedTrack = album.songs[idx];
        if (selectedTrack && selectedTrack.url) {
          playTrack(selectedTrack.url, album.albumId, idx);
        } else {
          console.warn('Selected track is invalid or missing URL.');
        }
      } else {
        console.warn('Invalid track index.');
      }
    },
    [album.songs, playTrack, album.albumId]
  );

  // Handle play/pause button click
  const handlePlayPause = useCallback(
    (e) => {
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      if (currentTrackIndexLocal === null) {
        if (album.songs && album.songs.length > 0) {
          handleTrackClick(e, 0);
        } else {
          console.warn('No tracks available.');
        }
        return;
      }

      if (isThisTrackPlaying) {
        pauseTrack();
      } else if (isThisTrackPaused) {
        currentHowl.play();
      } else {
        const currentSong = album.songs && album.songs[currentTrackIndexLocal];
        if (currentSong && currentSong.url) {
          playTrack(currentSong.url, album.albumId, currentTrackIndexLocal);
        } else {
          console.warn('Invalid track or missing URL.');
        }
      }
    },
    [
      currentTrackIndexLocal,
      album.songs,
      isThisTrackPlaying,
      isThisTrackPaused,
      pauseTrack,
      currentHowl,
      playTrack,
      album.albumId,
      handleTrackClick,
    ]
  );

  // Set song durations when album changes
  useEffect(() => {
    if (album.songs && album.songs.length > 0) {
      const durations = {};
      album.songs.forEach((song, idx) => {
        durations[idx] = song.duration || 0;
      });
      setSongDurations(durations);
    } else {
      setSongDurations({});
    }
  }, [album]);

  // Debounced seek function
  const debouncedHandleSeek = useMemo(
    () =>
      debounce((seekTime) => {
        if (
          (isThisTrackPlaying || isThisTrackPaused) &&
          currentTrackIndexLocal !== null &&
          songDurations[currentTrackIndexLocal] > 0
        ) {
          seekTo(seekTime);
        }
      }, 300),
    [isThisTrackPlaying, isThisTrackPaused, currentTrackIndexLocal, songDurations, seekTo]
  );

  // Handle seek input change
  const handleSeek = useCallback(
    (e) => {
      e.stopPropagation();
      const seekPercent = e.target.value;
      const seekTime = (seekPercent / 100) * songDurations[currentTrackIndexLocal];
      debouncedHandleSeek(seekTime);
    },
    [currentTrackIndexLocal, songDurations, debouncedHandleSeek]
  );

  // Format time in mm:ss
  const formatTime = (time) => {
    if (time === null || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Animate the image scaling on flip
  useLayoutEffect(() => {
    if (!isMobile) {
      anime({
        targets: imgRef.current,
        scale: isFlipped ? 0.8 : 1,
        borderColor: isFlipped ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        borderWidth: '8px',
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  }, [isFlipped, isMobile]);

  // Sync current track index with global audio state
  useEffect(() => {
    if (isPlaying && currentAlbumId === album.albumId) {
      const currentSrc = currentHowl?._src?.[0] ? currentHowl._src[0].toLowerCase() : '';
      const trackIdx = album.songs.findIndex(
        (song) => song.url?.toLowerCase() === currentSrc
      );
      if (trackIdx !== -1 && trackIdx !== currentTrackIndexLocal) {
        setCurrentTrackIndexLocal(trackIdx);
      }
    }
  }, [currentHowl, isPlaying, album, currentTrackIndexLocal]);

  // Render the list of tracks
  const renderTrackList = useMemo(() => {
    if (!album.songs || album.songs.length === 0) {
      return <div className="mt-4 text-center text-gray-500">No tracks available</div>;
    }

    return (
      <div className="mt-4 w-full max-h-60 overflow-y-auto custom-scrollbar">
        {album.songs.map((song, idx) => (
          <div
            key={idx}
            className={clsx(
              'flex justify-between items-center cursor-pointer hover:bg-gray-300 rounded-md',
              {
                'bg-gray-400': currentTrackIndexLocal === idx && (isThisTrackPlaying || isThisTrackPaused),
              }
            )}
            onClick={(e) => handleTrackClick(e, idx)}
            style={{ padding: '10px', borderRadius: '5px' }}
          >
            <p className="text-black">{song.trackTitle || `Track ${idx + 1}`}</p>
            <span className="text-sm text-gray-500">
              {songDurations[idx] && !isNaN(songDurations[idx]) ? formatTime(songDurations[idx]) : 'Unknown'}
            </span>
          </div>
        ))}
      </div>
    );
  }, [
    album.songs,
    currentTrackIndexLocal,
    isThisTrackPlaying,
    isThisTrackPaused,
    songDurations,
    handleTrackClick,
  ]);

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
      });
    }
  }, [isMobile, isFlipped]);

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
      });
    }
  }, [isMobile, isFlipped]);

  // Prevent propagation when clicking on content
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  // Define the handleFlip function
  const handleFlip = useCallback(() => {
    toggleFlip(album.albumId);
  }, [toggleFlip, album.albumId]);

  // Add console log to verify embedUrl and imageUrl
  useEffect(() => {
  }, [album.albumId, album.embedUrl, album.imageUrl]);

  return (
    <div ref={ref} className="relative w-full mb-8 px-4 sm:px-0" data-album-id={album.albumId}>
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">
        {album.title || 'Untitled Album'}
      </h2>

      <div className="relative max-w-lg mx-auto">
        <div className={`w-full ${isMobile ? 'mobile-container' : 'flip-container'} ${isFlipped ? (isMobile ? 'mobile-expanded' : 'flipped') : ''}`}>
          {/* Front of the card */}
          <div
            className={`${isMobile ? 'mobile-front' : 'flip-front absolute inset-0'} bg-black/0 rounded-lg ${isMobile ? '' : 'backface-hidden'}`}
            onClick={handleFlip} // handleFlip is now defined
          >
            <div className="w-full cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <div className="w-full h-0 pb-[100%] relative">
                <Image
                  ref={imgRef}
                  src={album.customImage?.asset?.url || album.imageUrl || '/images/placeholder.png'}
                  alt={album.title || 'Album Image'}
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
                <FontAwesomeIcon icon={faSyncAlt} className="text-white opacity-50" />
              </div>
            )}
          </div>

          {/* Back of the card */}
          <div
            className={`${isMobile ? 'mobile-back' : 'flip-back absolute inset-0'} rounded-lg ${isMobile ? '' : 'backface-hidden overflow-hidden'}`}
            onClick={handleFlip}
          >
            <div className="w-full h-full" onClick={handleContentClick}>
              {album.songs && album.songs.length > 0 ? (
                <div className="custom-player md:h-[500px] bg-white w-full p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
                  {/* Player UI */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Image
                      src={album.imageUrl || '/images/placeholder.png'} // Ensure album.imageUrl is used
                      alt={album.title}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                      priority
                    />
                    <div>
                      <p className="text-xl font-semibold text-black">{album.title}</p>
                      <p className="text-sm text-gray-500">{album.artist || 'Unknown Artist'}</p>
                    </div>
                  </div>

                  <div className="flex justify-center items-center mt-4">
                    <button
                      className="text-black bg-gray-300 hover:bg-gray-400 rounded-full p-4"
                      onClick={(e) => handlePlayPause(e)}
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

                  <div className="mt-4 w-full">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={
                        currentTrackIndexLocal !== null && songDurations[currentTrackIndexLocal] > 0
                          ? (currentTime / songDurations[currentTrackIndexLocal]) * 100
                          : 0
                      }
                      className="w-full"
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSeek(e);
                      }}
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {currentTrackIndexLocal !== null && (isThisTrackPlaying || currentTime > 0)
                          ? formatTime(currentTime)
                          : '00:00'}
                      </span>
                      <span>
                        {currentTrackIndexLocal !== null && songDurations[currentTrackIndexLocal] > 0
                          ? formatTime(songDurations[currentTrackIndexLocal])
                          : '00:00'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 w-full max-h-60 overflow-y-auto custom-scrollbar">
                    {renderTrackList}
                  </div>
                </div>
              ) : (
                <div className="spotify-embed">
                  {album.embedUrl && <SpotifyEmbed embedUrl={album.embedUrl} title={album.title} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .flip-container {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .flip-front,
        .flip-back {
          backface-visibility: hidden;
          transition: transform 0.6s;
        }

        .flip-back {
          transform: rotateY(180deg);
        }

        .flipped .flip-front {
          transform: rotateY(180deg);
        }

        .flipped .flip-back {
          transform: rotateY(0deg);
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

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

          .spotify-embed {
            background-color: transparent;
          }
        }

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
        .spotify-embed-container {
          width: 100%;
          height: 352px;
          position: relative;
        }

        .spotify-loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.8);
          z-index: 10;
          border-radius: 12px;
        }

        .spotify-iframe {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease-in;
        }

        .spotify-iframe.loaded {
          opacity: 1;
        }
      `}</style>
    </div>
  );
});

export default FlipCard;
