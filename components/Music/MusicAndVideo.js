// components/Music/MusicAndVideo.js

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavbar } from '../../context/NavbarContext';
import { AudioProvider } from '../../context/AudioContext';
import FlipCard from '../FlipCard';
import YouTubeEmbed from '../media/YouTubeEmbed';
import SpotifyEmbed from '../SpotifyEmbed';
import debounce from 'lodash/debounce';
import { YouTubeAPIProvider } from '../media/YouTubeAPIProvider';
import Image from 'next/image';
import LazyLoad from 'react-lazyload';
import { extractYouTubeID } from '../../utils/extractYouTubeID'; // Import the utility here

export default function MusicAndVideo({ videoPreLink }) {
  const [albums, setAlbums] = useState([]);
  const [flippedAlbums, setFlippedAlbums] = useState(new Set());
  const { setNavbarData } = useNavbar();
  const flipCardRefs = useRef({});

  const memoizedVideoPreLink = useMemo(() => videoPreLink, [videoPreLink]);

  const heroLink = useMemo(() => memoizedVideoPreLink?.heroLink || '', [memoizedVideoPreLink]);
  const heroVideoID = useMemo(() => extractYouTubeID(heroLink), [heroLink]); // Use the utility here
  const lookTitle = useMemo(() => memoizedVideoPreLink?.lookTitle || 'LOOK', [memoizedVideoPreLink]);
  const listenTitle = useMemo(() => memoizedVideoPreLink?.listenTitle || 'LISTEN', [memoizedVideoPreLink]);
  const backgroundVideoFileUrl = useMemo(() => memoizedVideoPreLink?.backgroundVideo?.backgroundVideoFile?.asset?.url, [memoizedVideoPreLink]);
  const backgroundVideoUrl = useMemo(() => backgroundVideoFileUrl || memoizedVideoPreLink?.backgroundVideo?.backgroundVideoUrl, [backgroundVideoFileUrl, memoizedVideoPreLink]);

  const lookId = videoPreLink?.lookTitle?.replace(/\s+/g, '-') || 'LOOK';
  const listenId = videoPreLink?.listenTitle?.replace(/\s+/g, '-') || 'LISTEN';

  const listenRef = useRef(null);

  useEffect(() => {
    if (setNavbarData) {
      setNavbarData((prevData) => {
        if (!prevData) return prevData;

        const updatedNavigationLinks = prevData.navigationLinks.filter(
          (link) => link.name !== lookTitle && link.name !== listenTitle
        );

        updatedNavigationLinks.push(
          { name: lookTitle, href: `/#${lookId}` },
          { name: listenTitle, href: `/#${listenId}` }
        );

        return {
          ...prevData,
          navigationLinks: updatedNavigationLinks,
        };
      });
    }
  }, [lookTitle, listenTitle, setNavbarData, lookId, listenId]);

  const fetchAlbumData = useCallback(async () => {
    if (memoizedVideoPreLink?.musicLink) {
      const processedAlbums = memoizedVideoPreLink.musicLink.map((album, index) => {
        if (album.albumSource === 'embedded' && album.embeddedAlbum) {
          return {
            albumSource: 'embedded',
            albumId: album._id || `embedded-${index}`,
            embedUrl: album.embeddedAlbum?.embedUrl,
            title: album.embeddedAlbum?.title || 'Untitled Release',
            artist: album.embeddedAlbum?.artist || 'Unknown Artist',
            imageUrl: album.embeddedAlbum?.imageUrl || '/images/placeholder.png',
            platform: album.embeddedAlbum?.platform || 'spotify',
            releaseType: album.embeddedAlbum?.releaseType || 'album',
            customImage: album.embeddedAlbum?.customImage,
            index,
          };
        } else if (album.albumSource === 'custom' && album.customAlbum) {
          return {
            albumSource: 'custom',
            albumId: album._id || `custom-${index}`,
            title: album.customAlbum?.title || 'Untitled Release',
            artist: album.customAlbum?.artist || 'Unknown Artist',
            imageUrl: album.customAlbum?.customImage?.asset?.url || '/images/placeholder.png',
            songs: album.customAlbum?.songs || [],
            releaseType: album.customAlbum?.releaseType || 'album',
            customImage: album.customAlbum?.customImage,
            index,
          };
        }
        return null;
      }).filter(Boolean);

      setAlbums(processedAlbums);
    }
  }, [memoizedVideoPreLink]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  const debouncedFetchAlbumData = useMemo(
    () => debounce(fetchAlbumData, 300),
    [fetchAlbumData]
  );

  useEffect(() => {
    debouncedFetchAlbumData();
    return () => debouncedFetchAlbumData.cancel();
  }, [debouncedFetchAlbumData]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFlip = useCallback((albumId) => {
    setFlippedAlbums((prev) => {
      const newFlipped = new Set(prev);
      if (newFlipped.has(albumId)) {
        newFlipped.delete(albumId);
      } else {
        if (isMobile) {
          newFlipped.clear();
        }
        newFlipped.add(albumId);
      }
      return newFlipped;
    });
  }, [isMobile]);

  const addFlipCardRef = useCallback((albumId, ref) => {
    if (ref) {
      flipCardRefs.current[albumId] = ref;
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = !Object.values(flipCardRefs.current).some((ref) =>
        ref?.contains(event.target)
      );

      if (clickedOutside) {
        const clickedOnAnotherCard = albums.some(album =>
          event.target.closest(`[data-album-id="${album.albumId}"]`)
        );

        if (!clickedOnAnotherCard) {
          setFlippedAlbums(new Set());
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [albums]);

  return (
    <AudioProvider>
      <YouTubeAPIProvider>
        <div style={{ minHeight: '200vh', backgroundColor: 'black', position: 'relative' }}>
          {backgroundVideoUrl && (
            <div className="sticky top-0 w-full h-[40vh] sm:h-screen z-30">
              <video
                className="w-full h-[40vh] sm:h-full object-cover"
                src={backgroundVideoUrl}
                poster={memoizedVideoPreLink?.backgroundVideo?.posterImage?.asset?.url || ''}
                muted
                autoPlay
                loop
                playsInline
                controls={false}
                preload="auto"
              />
            </div>
          )}

          <div className="relative z-50">
            <div className="parallax-container flex flex-col items-center justify-center w-full h-full z-50">
              <div className="flex flex-col items-center justify-center mb-16 sm:mb-24 w-full px-4 sm:px-12">
                <div className="mb-8 sm:mb-16 rounded-lg w-full text-center">
                  <p
                    className="mt-8 text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold"
                    id={lookId}
                  >
                    {lookTitle}
                  </p>
                </div>
                {heroVideoID && (
                  <div className="w-full max-w-[1064px]">
                    <YouTubeEmbed
                      embedId={heroVideoID}
                      title="Hero YouTube video"
                      className="border-4 sm:border-8 border-black/50 md:rounded-lg"
                      size="hero"
                    />
                  </div>
                )}
              </div>

              <div className="w-full grid-container px-4 sm:px-12 mt-16 sm:mt-24 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 z-50">
                {memoizedVideoPreLink?.vidLink?.map((link, i) => {
                  const videoId = extractYouTubeID(link); // Use the utility here
                  return videoId ? (
                    <div key={`vid-${i}`} data-key={`vid-${i}`} className="w-full sm:max-w-4xl mb-16 sm:mb-24">
                      <YouTubeEmbed
                        embedId={videoId}
                        title={`YouTube video ${i + 1}`}
                        className="border-4 sm:border-8 border-black/50 md:rounded-lg"
                        size="xl"
                      />
                    </div>
                  ) : null;
                })}
              </div>

              <div ref={listenRef} id={listenId} className="w-full flex mt-8 sm:mt-12 gap-y-8 sm:gap-y-12 flex-col items-center z-50 px-4">
                <div className="mt-16 mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
                  <p className="text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold">
                    {videoPreLink?.listenTitle || 'LISTEN'}
                  </p>
                </div>

                <div className="w-full relative z-50 grid grid-cols-1 pb-32 sm:grid-cols-2 gap-16 sm:gap-12 md:gap-16 lg:gap-24 px-4 md:px-8 lg:px-32">
                  {albums.map((album) => (
                    <LazyLoad key={album.albumId} height={200} offset={100}>
                      <FlipCard
                        album={album}
                        isFlipped={flippedAlbums.has(album.albumId)}
                        toggleFlip={handleFlip}
                      />
                    </LazyLoad>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </YouTubeAPIProvider>
    </AudioProvider>
  );
}
