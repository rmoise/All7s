// AudioContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Howl } from 'howler';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentHowl, setCurrentHowl] = useState(null);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null); // Changed to null
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let rafId;

    const update = () => {
      if (currentHowl && currentHowl.playing()) {
        const seek = currentHowl.seek();
        setCurrentTime(typeof seek === 'number' ? seek : 0);
        rafId = requestAnimationFrame(update);
      }
      // Removed the else block to prevent resetting currentTime
    };

    if (currentHowl && currentHowl.playing()) {
      rafId = requestAnimationFrame(update);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [currentHowl, isPlaying]);

  // Function to play or resume a track
  const playTrack = (url, albumId, trackIndex = 0) => {
    // Check if the same track is already loaded
    if (
      currentHowl &&
      currentAlbumId === albumId &&
      currentTrackIndex === trackIndex
    ) {
      if (!isPlaying) {
        currentHowl.play();
        setIsPlaying(true);
      }
      // If already playing, do nothing
    } else {
      // Stop any existing track
      if (currentHowl) {
        currentHowl.stop();
      }

      // Create a new Howl instance for the new track
      const newHowl = new Howl({
        src: [url],
        html5: true, // Ensures proper playback on mobile
        preload: false, // Do not preload to save bandwidth
        onplay: () => {
          setIsPlaying(true);
          setCurrentAlbumId(albumId);
          setCurrentTrackIndex(trackIndex);
          requestAnimationFrame(updateTime);
        },
        onpause: () => {
          setIsPlaying(false);
        },
        onstop: () => {
          setIsPlaying(false);
          setCurrentAlbumId(null);
          setCurrentTime(0); // Reset time to 0 when the track is stopped
          setCurrentTrackIndex(null); // Changed to null
        },
        onend: () => {
          setIsPlaying(false);
          setCurrentAlbumId(null);
          setCurrentTime(0); // Reset time to 0 when the track ends
          setCurrentTrackIndex(null); // Changed to null
        },
        onloaderror: (id, error) => {
          console.error(`Error loading track: ${error}`);
        },
        onplayerror: (id, error) => {
          console.error(`Error playing track: ${error}`);
          newHowl.once('unlock', () => {
            newHowl.play();
          });
        },
      });

      setCurrentHowl(newHowl);
      newHowl.play();
    }
  };

  // Function to pause the current track
  const pauseTrack = () => {
    if (currentHowl && currentHowl.playing()) {
      currentHowl.pause();
    }
  };

  // Function to stop the current track
  const stopTrack = () => {
    if (currentHowl) {
      currentHowl.stop();
      setCurrentHowl(null);
      setCurrentAlbumId(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrackIndex(null);
    }
  };

  // Function to seek to a specific time
  const seekTo = (seekTime) => {
    if (currentHowl && typeof seekTime === 'number') {
      currentHowl.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  // Function to update current time
  const updateTime = () => {
    if (currentHowl && currentHowl.playing()) {
      const seek = currentHowl.seek();
      setCurrentTime(typeof seek === 'number' ? seek : 0);
      requestAnimationFrame(updateTime);
    }
  };

  // Cleanup Howl instance on unmount
  useEffect(() => {
    return () => {
      if (currentHowl) {
        currentHowl.unload();
      }
    };
  }, [currentHowl]);

  return (
    <AudioContext.Provider
      value={{
        currentHowl,
        currentAlbumId,
        currentTrackIndex,
        isPlaying,
        currentTime,
        playTrack,
        pauseTrack,
        stopTrack,
        seekTo,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Custom hook for easy access
export const useAudio = () => {
  return useContext(AudioContext);
};
