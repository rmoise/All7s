import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { Howl } from 'howler';
import { throttle } from 'lodash';
import Image from 'next/image';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentHowl, setCurrentHowl] = useState(null);
  const [currentAlbumId, setCurrentAlbumId] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
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

  const playTrack = useCallback((url, albumId, trackIndex = 0) => {
    if (
      currentHowl &&
      currentAlbumId === albumId &&
      currentTrackIndex === trackIndex
    ) {
      if (!isPlaying) {
        currentHowl.play();
        setIsPlaying(true);
      }
      return;
    }

    if (currentHowl) {
      currentHowl.stop();
    }

    const newHowl = new Howl({
      src: [url],
      html5: true,
      preload: false,
      onplay: () => {
        setIsPlaying(true);
        setCurrentAlbumId(albumId);
        setCurrentTrackIndex(trackIndex);
      },
      onpause: () => setIsPlaying(false),
      onstop: resetAudioState,
      onend: resetAudioState,
      onloaderror: (id, error) => console.error(`Error loading track: ${error}`),
      onplayerror: (id, error) => {
        console.error(`Error playing track: ${error}`);
        newHowl.once('unlock', () => newHowl.play());
      },
    });

    setCurrentHowl(newHowl);
    newHowl.play();
  }, [currentHowl, currentAlbumId, currentTrackIndex, isPlaying]);

  const resetAudioState = useCallback(() => {
    setIsPlaying(false);
    setCurrentAlbumId(null);
    setCurrentTime(0);
    setCurrentTrackIndex(null);
  }, []);

  const pauseTrack = useCallback(() => {
    if (currentHowl && currentHowl.playing()) {
      currentHowl.pause();
      setIsPlaying(false);
    }
  }, [currentHowl]);

  const throttledSeekTo = useMemo(
    () => throttle((seekTime) => {
      if (currentHowl && typeof seekTime === 'number') {
        currentHowl.seek(seekTime);
        setCurrentTime(seekTime);
      }
    }, 100),
    [currentHowl]
  );

  const stopTrack = useCallback(() => {
    if (currentHowl) {
      currentHowl.stop();
      setCurrentHowl(null);
      setCurrentAlbumId(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrackIndex(null);
    }
  }, [currentHowl]);

  useEffect(() => {
    return () => {
      if (currentHowl) {
        currentHowl.unload();
      }
    };
  }, [currentHowl]);

  const value = useMemo(() => ({
    currentHowl,
    currentAlbumId,
    currentTrackIndex,
    isPlaying,
    currentTime,
    playTrack,
    pauseTrack,
    stopTrack,
    seekTo: throttledSeekTo,
  }), [currentHowl, currentAlbumId, currentTrackIndex, isPlaying, currentTime, playTrack, pauseTrack, stopTrack, throttledSeekTo]);

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// Custom hook for easy access
export const useAudio = () => {
  return useContext(AudioContext);
};
