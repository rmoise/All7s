import React, { forwardRef, useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause } from '@fortawesome/free-solid-svg-icons';
import anime from 'animejs';
import { useAudio } from '../context/AudioContext.jsx';

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
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (album.songs && album.songs.length > 0) {
      const durations = {};
      album.songs.forEach((song, idx) => {
        durations[idx] = song.duration || 0;
      });
      setSongDurations(durations);
    }
  }, [album]);

  const isThisTrackPlaying =
    isPlaying &&
    currentAlbumId === album.albumId &&
    currentTrackIndex === currentTrackIndexLocal;

  const isThisTrackPaused =
    !isPlaying &&
    currentAlbumId === album.albumId &&
    currentTrackIndex === currentTrackIndexLocal;

  const handlePlayPause = () => {
    if (currentTrackIndexLocal === null) {
      if (album.songs.length > 0) {
        handleTrackClick(0);
      } else {
        console.warn('No tracks available.');
      }
      return;
    }

    if (isThisTrackPlaying) {
      pauseTrack();
    } else if (isThisTrackPaused) {
      currentHowl.play(); // Resume playing the currently paused track
    } else {
      playTrack(album.songs[currentTrackIndexLocal].url, album.albumId, currentTrackIndexLocal);
    }
  };

  const handleTrackClick = (trackIndex) => {
    setCurrentTrackIndexLocal(trackIndex);
    const selectedTrackUrl = album.songs[trackIndex]?.url;
    if (selectedTrackUrl) {
      playTrack(selectedTrackUrl, album.albumId, trackIndex);
    }
  };

  const handleSeek = (e) => {
    const seekPercent = e.target.value;
    if (
      (isThisTrackPlaying || isThisTrackPaused) &&
      currentTrackIndexLocal !== null &&
      songDurations[currentTrackIndexLocal] > 0
    ) {
      const seekTime = (seekPercent / 100) * songDurations[currentTrackIndexLocal];
      seekTo(seekTime);
    }
  };

  const formatTime = (time) => {
    if (time === null || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

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

  return (
    <div ref={ref} className="relative w-full">
      {!isFlipped && (
        <p
          className="absolute top-0 w-full text-2xl sm:text-4xl mt-2 sm:mt-4 font-Headline text-white text-center z-10"
          aria-hidden="true"
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
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={album.imageUrl}
                          alt={album.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-xl font-semibold text-black">{album.title}</p>
                          <p className="text-sm text-gray-500">{album.artist || 'Unknown'}</p>
                        </div>
                      </div>

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
                          onChange={handleSeek}
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
                        {album.songs.map((song, idx) => (
                          <div
                            key={idx}
                            className={`flex justify-between items-center cursor-pointer hover:bg-gray-300 rounded-md ${
                              currentTrackIndexLocal === idx &&
                              (isThisTrackPlaying || isThisTrackPaused)
                                ? 'bg-gray-400'
                                : ''
                            }`}
                            onClick={() => handleTrackClick(idx)}
                            style={{ padding: '10px', borderRadius: '5px' }}
                          >
                            <p className="text-black">
                              {song.trackTitle || `Track ${idx + 1}`}
                            </p>
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
                    <div>
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
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flip-container aspect-w-1 aspect-h-1 relative">
            <div
              className={clsx(
                'flip-inner absolute inset-0 rounded-lg transition-transform duration-700 ease-in-out transform-style-preserve-3d',
                isFlipped ? 'flipped' : ''
              )}
            >
              <div
                className="flip-front absolute inset-0 bg-black/0 drop-shadow-2xl rounded-lg flex flex-col items-center justify-center backface-hidden"
                aria-hidden={isFlipped}
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

              <div
                className="flip-back absolute inset-0 drop-shadow-2xl rounded-lg p-4 backface-hidden rotateY-180"
                aria-hidden={!isFlipped}
                onClick={(e) => e.stopPropagation()}
              >
                {album.songs && album.songs.length > 0 ? (
                  <div className="custom-player md:h-[500px] w-full p-4 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xl font-semibold text-black">{album.title}</p>
                        <p className="text-sm text-gray-500">{album.artist || 'Unknown'}</p>
                      </div>
                    </div>

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
                        onChange={handleSeek}
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
                      {album.songs.map((song, idx) => (
                        <div
                          key={idx}
                          className={`flex justify-between items-center cursor-pointer hover:bg-gray-300 rounded-md ${
                            currentTrackIndexLocal === idx &&
                            (isThisTrackPlaying || isThisTrackPaused)
                              ? 'bg-gray-400'
                              : ''
                          }`}
                          onClick={() => handleTrackClick(idx)}
                          style={{ padding: '10px', borderRadius: '5px' }}
                        >
                          <p className="text-black">
                            {song.trackTitle || `Track ${idx + 1}`}
                          </p>
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
                  <div>
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
                  </div>
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

        .spotify-iframe {
          width: 100% !important;
          height: 500px !important; /* Default height for desktop */
          border: 0 !important;
          position: relative !important;
          overflow: visible !important;
        }

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

        .custom-player button {
          z-index: 10;
          position: relative;
        }

        .iframe-container {
          width: 100%;
          height: 352px;
        }

        button {
          outline: none;
        }

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
