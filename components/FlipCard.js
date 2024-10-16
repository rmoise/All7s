// FlipCard.jsx

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import anime from 'animejs';
import { useAudio } from '../context/AudioContext.jsx';
import { Howl } from 'howler';

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

  const [currentTrackIndexLocal, setCurrentTrackIndexLocal] = useState(0);
  const [songDurations, setSongDurations] = useState({});
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // Handle window resize to detect mobile devices
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload durations of songs
  useEffect(() => {
    if (album.songs && album.songs.length > 0) {
      const fetchDurations = async () => {
        const durations = {};
        for (let idx = 0; idx < album.songs.length; idx++) {
          const song = album.songs[idx];
          const trackUrl = song.file?.asset?.url;
          if (trackUrl) {
            const sound = new Howl({
              src: [trackUrl],
              html5: true,
              preload: true,
              onload: () => {
                durations[idx] = sound.duration();
                sound.unload(); // Clean up
                setSongDurations((prev) => ({ ...prev, [idx]: durations[idx] }));
              },
              onloaderror: (id, error) => {
                console.error(`Error loading track ${idx + 1}:`, error);
                durations[idx] = 0;
                sound.unload(); // Clean up
                setSongDurations((prev) => ({ ...prev, [idx]: durations[idx] }));
              },
            });
          } else {
            durations[idx] = 0;
            setSongDurations((prev) => ({ ...prev, [idx]: durations[idx] }));
          }
        }
      };

      fetchDurations();
    }
  }, [album]);

  // Determine if this track is currently playing or paused
  const isThisTrackPlaying =
    isPlaying &&
    currentAlbumId === album.albumId &&
    currentTrackIndex === currentTrackIndexLocal;

  const isThisTrackPaused =
    !isPlaying &&
    currentAlbumId === album.albumId &&
    currentTrackIndex === currentTrackIndexLocal;

  // Handle play/pause button click
  const handlePlayPause = () => {
    const trackUrl = album.songs[currentTrackIndexLocal]?.file?.asset?.url;
    if (trackUrl) {
      if (isThisTrackPlaying || isThisTrackPaused) {
        // Toggle play/pause
        if (isPlaying) {
          pauseTrack();
        } else {
          playTrack(trackUrl, album.albumId, currentTrackIndexLocal);
        }
      } else {
        // Play the selected track
        playTrack(trackUrl, album.albumId, currentTrackIndexLocal);
      }
    } else {
      console.warn('No track URL available.');
    }
  };

  // Handle track selection
  const handleTrackClick = (trackIndex) => {
    setCurrentTrackIndexLocal(trackIndex);
    const selectedTrackUrl = album.songs[trackIndex]?.file?.asset?.url;
    if (selectedTrackUrl) {
      playTrack(selectedTrackUrl, album.albumId, trackIndex);
    }
  };

  // Handle seeking
  const handleSeek = (e) => {
    const seekPercent = e.target.value;
    if ((isThisTrackPlaying || isThisTrackPaused) && songDurations[currentTrackIndexLocal] > 0) {
      const seekTime = (seekPercent / 100) * songDurations[currentTrackIndexLocal];
      seekTo(seekTime);
    }
  };

  // Format time in mm:ss
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle mouse enter and leave for desktop animations
  const handleMouseEnter = () => {
    if (!isMobile) {
      anime({
        targets: imgRef.current,
        scale: 0.8,
        borderColor: 'rgba(255, 0, 0, 0.5)',
        borderWidth: '8px',
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      anime({
        targets: imgRef.current,
        scale: 1,
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: '8px',
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  };

  // Update the current track index when the album changes
  useEffect(() => {
    if (isPlaying && currentAlbumId === album.albumId) {
      const currentSrc = currentHowl?.src()[0].toLowerCase();
      const trackIdx = album.songs.findIndex(
        (song) => song.file?.asset?.url.toLowerCase() === currentSrc
      );
      if (trackIdx !== -1 && trackIdx !== currentTrackIndexLocal) {
        setCurrentTrackIndexLocal(trackIdx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHowl]);

  return (
    <div ref={ref} className="relative w-full">
      {/* Album Title Overlay */}
      {!isFlipped && (
        <p
          className="absolute top-0 w-full text-2xl sm:text-4xl mt-2 sm:mt-4 font-Headline text-white text-center z-10"
          aria-hidden="true" // Assuming the title is decorative when not flipped
        >
          {album.title || album.description}
        </p>
      )}

      <div className={`relative mt-10 w-full ${isMobile ? '' : 'flip-container'}`}>
        {isMobile ? (
          <div className="album-wrapper">
            <div className="w-full">
              {!isFlipped ? (
                <img
                  ref={imgRef}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                  style={{ aspectRatio: '1/1' }}
                  src={album.imageUrl}
                  alt={album.title || album.description}
                  onClick={() => toggleFlip(album.albumId)}
                />
              ) : (
                <div className="w-full" onClick={(e) => e.stopPropagation()}>
                  {album.songs && album.songs.length > 0 ? (
                    <div className="custom-player w-full p-4 bg-white rounded-lg shadow-lg">
                      {/* Audio Controls */}
                      <div className="flex items-center space-x-4 mb-4">
                        <img src={album.imageUrl} alt={album.title} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <p className="text-xl font-semibold text-black">{album.title}</p>
                          <p className="text-sm text-gray-500">{album.artist || 'Unknown'}</p>
                        </div>
                      </div>

                      {/* Play/Pause Button */}
                      <div className="flex justify-center items-center mt-4">
                        <button
                          className="text-black bg-gray-300 hover:bg-gray-400 rounded-full p-4"
                          onClick={handlePlayPause}
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
                          {isThisTrackPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                        </button>
                      </div>

                      {/* Seek Bar */}
                      <div className="mt-4 w-full">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={
                            songDurations[currentTrackIndexLocal] > 0
                              ? (currentTime / songDurations[currentTrackIndexLocal]) * 100
                              : 0
                          }
                          className="w-full"
                          onChange={handleSeek}
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{isThisTrackPlaying ? formatTime(currentTime) : '00:00'}</span>
                          <span>
                            {songDurations[currentTrackIndexLocal] > 0
                              ? formatTime(songDurations[currentTrackIndexLocal])
                              : '00:00'}
                          </span>
                        </div>
                      </div>

                      {/* Track List */}
                      <div className="mt-4 w-full max-h-60 overflow-y-auto custom-scrollbar">
                        {album.songs.map((song, idx) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center cursor-pointer hover:bg-gray-300 rounded-md ${
                              currentTrackIndexLocal === idx && (isThisTrackPlaying || isThisTrackPaused) ? 'bg-gray-400' : ''
                            }`}
                            onClick={() => handleTrackClick(idx)}
                            style={{ padding: '10px', borderRadius: '5px' }}
                          >
                            <p className="text-black">{song.trackTitle || `Track ${idx + 1}`}</p>
                            <span className="text-sm text-gray-500">
                              {songDurations[idx] && !isNaN(songDurations[idx])
                                ? `${formatTime(songDurations[idx])}`
                                : 'Unknown'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Spotify Embed */}
                      {album.parsedEmbedUrl && (
                        <div className="iframe-container">
                          <iframe
                            src={album.parsedEmbedUrl}
                            className="spotify-iframe"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={`Spotify album ${album.title}`}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Desktop View with Flip Animation */
          <div className="flip-container aspect-w-1 aspect-h-1 relative">
            <div
              className={clsx(
                'flip-inner absolute inset-0 rounded-lg transition-transform duration-700 ease-in-out transform-style-preserve-3d',
                isFlipped ? 'flipped' : ''
              )}
            >
              {/* Front Side */}
              <div
                className="flip-front absolute inset-0 bg-black/0 drop-shadow-2xl rounded-lg flex flex-col items-center justify-center backface-hidden"
                aria-hidden={isFlipped} // Hide front side when flipped
              >
                <img
                  ref={imgRef}
                  className="album-image w-11/12 h-auto object-cover rounded-lg border-8 border-black/50 cursor-pointer"
                  src={album.imageUrl}
                  alt={album.title || album.description}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => toggleFlip(album.albumId)}
                />
              </div>

              {/* Back Side */}
              <div
                className="flip-back absolute inset-0 drop-shadow-2xl rounded-lg p-4 backface-hidden rotateY-180"
                aria-hidden={!isFlipped} // Hide back side when not flipped
                onClick={(e) => e.stopPropagation()}
              >
                {album.songs && album.songs.length > 0 ? (
                  <div className="custom-player md:h-[500px] w-full p-4 rounded-lg shadow-lg">
                    {/* Audio Controls */}
                    <div className="flex items-center space-x-4 mb-4">
                      <img src={album.imageUrl} alt={album.title} className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <p className="text-xl font-semibold text-black">{album.title}</p>
                        <p className="text-sm text-gray-500">{album.artist || 'Unknown'}</p>
                      </div>
                    </div>

                    {/* Play/Pause Button */}
                    <div className="flex justify-center items-center mt-4">
                      <button
                        className="text-black bg-gray-300 hover:bg-gray-400 rounded-full p-4"
                        onClick={handlePlayPause}
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
                        {isThisTrackPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                      </button>
                    </div>

                    {/* Seek Bar */}
                    <div className="mt-4 w-full">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={
                          songDurations[currentTrackIndexLocal] > 0
                            ? (currentTime / songDurations[currentTrackIndexLocal]) * 100
                            : 0
                        }
                        className="w-full"
                        onChange={handleSeek}
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{isThisTrackPlaying ? formatTime(currentTime) : '00:00'}</span>
                        <span>
                          {songDurations[currentTrackIndexLocal] > 0
                            ? formatTime(songDurations[currentTrackIndexLocal])
                            : '00:00'}
                        </span>
                      </div>
                    </div>

                    {/* Track List */}
                    <div className="mt-4 w-full max-h-60 overflow-y-auto custom-scrollbar">
                      {album.songs.map((song, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between items-center cursor-pointer hover:bg-gray-300 rounded-md ${
                            currentTrackIndexLocal === idx && (isThisTrackPlaying || isThisTrackPaused) ? 'bg-gray-400' : ''
                          }`}
                          onClick={() => handleTrackClick(idx)}
                          style={{ padding: '10px', borderRadius: '5px' }}
                        >
                          <p className="text-black">{song.trackTitle || `Track ${idx + 1}`}</p>
                          <span className="text-sm text-gray-500">
                            {songDurations[idx] && !isNaN(songDurations[idx])
                              ? `${formatTime(songDurations[idx])}`
                              : 'Unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Spotify Embed */}
                    {album.parsedEmbedUrl && (
                      <div className="iframe-container">
                        <iframe
                          src={album.parsedEmbedUrl}
                          className="spotify-iframe"
                          frameBorder="0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          allowFullScreen
                          title={`Spotify album ${album.title}`}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for Flip Effect and Scrollbar */}
      <style jsx>{`
        .flip-container {
          perspective: 1000px;
        }

        .flip-inner {
          position: absolute;
          width: 100%;
          transform-style: preserve-3d;
        }

        .flipped {
          transform: rotateY(180deg);
        }

        .flip-front,
        .flip-back {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
          top: 0;
          left: 0;
        }

        .flip-back {
          transform: rotateY(180deg);
        }

        .album-image {
          transition: all 0.3s ease-out;
          border: 8px solid rgba(0, 0, 0, 0.5);
          border-radius: 8px;
        }

        .custom-player {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative; /* Ensure play button is on top */
          padding: 20px;
        }

        .iframe-container {
          position: relative;
          z-index: 1;
          pointer-events: auto;
        }

        /* Override the problematic spotify-iframe class */
        .spotify-iframe {
          width: 100% !important;
          height: 500px !important; /* Default height for desktop */
          border: 0 !important;
          position: relative !important;
          overflow: visible !important;
        }

        /* Media query for mobile */
        @media (max-width: 768px) {
          .spotify-iframe {
            height: 352px !important; /* Mobile height */
          }
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }

        .max-h-60 {
          max-height: 15rem;
        }

        .bg-gray-400 {
          background-color: #cbd5e0;
        }

        /* Ensure the play button is clickable */
        .custom-player button {
          z-index: 10;
          position: relative;
        }

        /* Ensure iframe does not overlap custom player */
        .custom-player {
          position: relative;
        }

        /* Prevent iframe from covering other elements */
        .iframe-container {
          width: 100%;
          height: 352px; /* Match mobile height; desktop will override */
        }

        /* Adjust play button styling */
        button {
          outline: none;
        }

        /* Optional: Loading spinner styling */
        .loading-spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

export default FlipCard;
