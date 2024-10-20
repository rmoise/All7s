import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { urlFor } from '../../lib/client';
import { useNavbar } from '../../context/NavbarContext';
import { AudioProvider } from '../../context/AudioContext';
import FlipCard from '../FlipCard';
import YouTubeEmbed from '../media/YouTubeEmbed';
import { Howl } from 'howler';
import SpotifyEmbed from '../SpotifyEmbed';
import debounce from 'lodash/debounce'; // Import debounce from lodash
import { YouTubeAPIProvider } from '../media/YouTubeAPIProvider';
import Image from 'next/image';
import LazyLoad from 'react-lazyload';

const extractYouTubeID = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    let videoId;
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    }
    return videoId || null;
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return null;
  }
};

const extractSpotifyEmbedUrlFromIframe = (iframe) => {
  if (!iframe) return null;
  try {
    const srcRegex = /src="([^"]+)"/i;
    const match = iframe.match(srcRegex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting Spotify embed URL:', error);
    return null;
  }
};

const getSpotifyMetadata = async (url) => {
  const cacheKey = `spotify-metadata-${url}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  try {
    const response = await fetch(`/.netlify/functions/spotify-metadata?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify metadata: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const result = {
      title: data.title || 'Unknown Title',
      imageUrl: data.imageUrl,
      embedUrl: data.embedUrl,
    };
    localStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    return null;
  }
};

const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeID(url);
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
};

const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function getCachedData(key) {
  const cachedData = localStorage.getItem(key);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_EXPIRATION) {
      return data;
    }
  }
  return null;
}

function setCachedData(key, data) {
  const cacheObject = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(cacheObject));
}

const fetchSpotifyMetadata = async (spotifyUrls) => {
  const cachedMetadata = getCachedData('spotifyMetadata');
  if (cachedMetadata) {
    return cachedMetadata;
  }

  // ... existing fetch logic ...

  setCachedData('spotifyMetadata', spotifyMetadata);
  return spotifyMetadata;
};

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function MusicAndVideo({ videoPreLink }) {
  const [albums, setAlbums] = useState([]);
  const [flippedAlbums, setFlippedAlbums] = useState(new Set());
  const { setNavbarData } = useNavbar();
  const flipCardRefs = useRef({});

  const memoizedVideoPreLink = useMemo(() => videoPreLink, [videoPreLink]);

  const heroLink = useMemo(() => memoizedVideoPreLink?.heroLink || '', [memoizedVideoPreLink]);
  const heroVideoID = useMemo(() => extractYouTubeID(heroLink), [heroLink]);
  const lookTitle = useMemo(() => memoizedVideoPreLink?.lookTitle || 'LOOK', [memoizedVideoPreLink]);
  const listenTitle = useMemo(() => memoizedVideoPreLink?.listenTitle || 'LISTEN', [memoizedVideoPreLink]);
  const backgroundVideoFileUrl = useMemo(() => memoizedVideoPreLink?.backgroundVideo?.backgroundVideoFile?.asset?.url, [memoizedVideoPreLink]);
  const backgroundVideoUrl = useMemo(() => backgroundVideoFileUrl || memoizedVideoPreLink?.backgroundVideo?.backgroundVideoUrl, [backgroundVideoFileUrl, memoizedVideoPreLink]);

  useEffect(() => {
    if (setNavbarData) {
      setNavbarData((prevData) => {
        if (!prevData) return prevData;

        const updatedNavigationLinks = prevData.navigationLinks.filter(
          (link) => link.name !== lookTitle && link.name !== listenTitle
        );

        updatedNavigationLinks.push(
          { name: lookTitle, href: '/#LOOK' },
          { name: listenTitle, href: '/#LISTEN' }
        );

        return {
          ...prevData,
          navigationLinks: updatedNavigationLinks,
        };
      });
    }
  }, [lookTitle, listenTitle, setNavbarData]);

  const fetchAlbumData = useCallback(async () => {
    if (memoizedVideoPreLink?.musicLink) {
      const spotifyUrls = memoizedVideoPreLink.musicLink
        .filter(album => album?.embedUrl?.includes('spotify.com'))
        .map(album => album.embedUrl)
        .filter(Boolean);

      let spotifyMetadata = {};
      if (spotifyUrls.length > 0) {
        try {
          const isNetlify = process.env.NEXT_PUBLIC_NETLIFY === 'true';
          console.log('Is Netlify:', isNetlify); // Add this line for debugging
          const functionUrl = isNetlify
            ? '/.netlify/functions/fetchBatchSpotifyMetadata'
            : '/api/fetchBatchSpotifyMetadata';

          console.log('Function URL:', functionUrl); // Add this line for debugging

          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: spotifyUrls }),
          });
          if (response.ok) {
            const data = await response.json();
            spotifyMetadata = data.reduce((acc, item, index) => {
              acc[spotifyUrls[index]] = item;
              return acc;
            }, {});
          } else {
            console.error('Error response:', await response.text()); // Add this line for debugging
          }
        } catch (error) {
          console.error('Error fetching batch Spotify metadata:', error);
        }
      }

      const albumData = memoizedVideoPreLink.musicLink.map((album, index) => {
        if (album?.embedUrl?.includes('spotify.com') && spotifyMetadata[album.embedUrl]) {
          const spotifyData = spotifyMetadata[album.embedUrl];
          return {
            ...album,
            parsedEmbedUrl: spotifyData.embedUrl,
            imageUrl: spotifyData.imageUrl, // Prioritize Spotify image
            title: album.title || spotifyData.title,
            index,
            albumId: album._id || `album-${index}`,
          };
        } else {
          return {
            ...album,
            parsedEmbedUrl: null,
            imageUrl: album.customImage ? urlFor(album.customImage).url() : '/images/placeholder.png',
            songs: album?.songs || [],
            title: album.title || 'Untitled Album',
            index,
            albumId: album._id || `album-${index}`,
          };
        }
      });

      const filteredData = albumData.filter((album) => album !== null);
      setAlbums(filteredData);
      setCachedData('albums', filteredData);
    }
  }, [memoizedVideoPreLink]);

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
          // On mobile, close other cards when opening a new one
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
        // Check if the click was on another album card
        const clickedOnAnotherCard = albums.some(album =>
          event.target.closest(`[data-album-id="${album.albumId}"]`)
        );

        if (!clickedOnAnotherCard) {
          // If not clicked on another card, close all open cards
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
          {/* Background Video */}
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
              {/* LOOK Section */}
              <div className="flex flex-col items-center justify-center mb-16 sm:mb-24 w-full px-4 sm:px-12">
                <div className="mb-8 sm:mb-16 rounded-lg w-full text-center">
                  <p
                    className="mt-8 text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold"
                    id="LOOK"
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

              {/* Additional YouTube Videos */}
              <div className="w-full grid-container px-4 sm:px-12 mt-16 sm:mt-24 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 z-50">
                {memoizedVideoPreLink?.vidLink?.map((link, i) => {
                  const videoId = extractYouTubeID(link);
                  return videoId ? (
                    <div key={i} className="w-full sm:max-w-4xl mb-16 sm:mb-24">
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

              {/* LISTEN Section */}
              <div className="w-full flex mt-8 sm:mt-12 gap-y-8 sm:gap-y-12 flex-col items-center z-50 px-4">
                <div className="mt-16 mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
                  <p
                    className="text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold"
                    id="LISTEN"
                  >
                    {listenTitle}
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
