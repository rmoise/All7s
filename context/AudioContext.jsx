// AudioContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Howl } from 'howler';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentHowl, setCurrentHowl] = useState(null);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let rafId;

    const update = () => {
      if (currentHowl && currentHowl.playing()) {
        setCurrentTime(currentHowl.seek());
        rafId = requestAnimationFrame(update);
      }
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

  // Function to play a track
  const playTrack = (url, albumId, trackIndex = 0) => {
    // If a track is already playing, stop it
    if (currentHowl) {
      currentHowl.stop();
      setCurrentHowl(null);
      setCurrentAlbumId(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrackIndex(0);
    }

    // Create a new Howl instance for the new track
    const newHowl = new Howl({
      src: [url],
      html5: true, // Ensures proper playback on mobile
      preload: true,
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
        setCurrentTime(0);
        setCurrentTrackIndex(0);
      },
      onend: () => {
        setIsPlaying(false);
        setCurrentAlbumId(null);
        setCurrentTime(0);
        setCurrentTrackIndex(0);
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
      setCurrentTrackIndex(0);
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
      setCurrentTime(currentHowl.seek());
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
