// MusicAndVideo.js

import React, { useState, useEffect, useRef } from 'react';
import { urlFor } from '../../lib/client';
import { useNavbar } from '../../context/NavbarContext';
import { AudioProvider } from '../../context/AudioContext';

import FlipCard from '../FlipCard';
import { Howl } from 'howler'; // Ensure Howl is imported

const extractYouTubeID = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    return null;
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
  try {
    const response = await fetch(`/api/fetchSpotifyMetadata?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify metadata: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      title: data.title || 'Unknown Title',
      imageUrl: data.imageUrl,
      embedUrl: data.embedUrl,
    };
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    return null;
  }
};

export default function MusicAndVideo({ videoPreLink }) {
  const [albums, setAlbums] = useState([]);
  const [flippedAlbums, setFlippedAlbums] = useState(new Set());
  const { setNavbarData } = useNavbar();
  const flipCardRefs = useRef({});

  const heroLink = videoPreLink?.heroLink || '';
  const heroVideoID = extractYouTubeID(heroLink);
  const lookTitle = videoPreLink?.lookTitle || 'LOOK';
  const listenTitle = videoPreLink?.listenTitle || 'LISTEN';
  const backgroundVideoFileUrl = videoPreLink?.backgroundVideo?.backgroundVideoFile?.asset?.url;
  const backgroundVideoUrl = backgroundVideoFileUrl || videoPreLink?.backgroundVideo?.backgroundVideoUrl;

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
  }, [lookTitle, listenTitle, setNavbarData, videoPreLink]);

  useEffect(() => {
    const fetchAlbumData = async () => {
      if (videoPreLink?.musicLink) {
        const albumPromises = videoPreLink.musicLink.map(async (album, index) => {
          if (
            album?.embedUrl?.includes('spotify.com') ||
            album?.embedUrl?.includes('soundcloud.com')
          ) {
            const spotifyUrl = extractSpotifyEmbedUrlFromIframe(album.embedUrl);
            if (spotifyUrl) {
              try {
                const spotifyData = await getSpotifyMetadata(spotifyUrl);
                if (!spotifyData) return null;
                return {
                  ...album,
                  parsedEmbedUrl: spotifyData.embedUrl,
                  imageUrl: album.customImage
                    ? urlFor(album.customImage).url()
                    : spotifyData.imageUrl,
                  title: album.title || spotifyData.title,
                  index,
                  albumId: album._id || `album-${index}`,
                };
              } catch (error) {
                console.warn(
                  `Spotify metadata could not be fetched for album at index ${index}: ${error.message}`
                );
                return null;
              }
            } else {
              return null;
            }
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

        const albumData = await Promise.all(albumPromises);
        setAlbums(albumData.filter((album) => album !== null));
      }
    };

    fetchAlbumData();
  }, [videoPreLink]);

  const handleFlip = (albumId) => {
    setFlippedAlbums((prev) => {
      const newFlipped = new Set(prev);
      if (newFlipped.has(albumId)) {
        newFlipped.delete(albumId);
      } else {
        newFlipped.add(albumId);
      }
      return newFlipped;
    });
  };

  const addFlipCardRef = (albumId, ref) => {
    if (ref) {
      flipCardRefs.current[albumId] = ref;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = !Object.values(flipCardRefs.current).some((ref) =>
        ref?.contains(event.target)
      );

      if (clickedOutside) {
        setFlippedAlbums(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [flipCardRefs]);

  return (
   <AudioProvider>
    <div style={{ minHeight: '200vh', backgroundColor: 'black', position: 'relative' }}>
      {/* Background Video */}
      {backgroundVideoUrl && (
        <div className="sticky top-0 w-full h-[40vh] sm:h-screen z-30">
          <video
            className="w-full h-[40vh] sm:h-full object-cover"
            src={backgroundVideoUrl}
            muted
            autoPlay
            loop
            playsInline
            controls={false}
          />
        </div>
      )}

      <div className="relative z-50">
        <div className="parallax-container flex flex-col items-center justify-center w-full h-full z-50">
          {/* LOOK Section */}
          <div className="flex flex-col items-center justify-center mb-8 sm:mb-20 w-screen px-4 sm:px-0">
            <div className="mb-8 sm:mb-12 rounded-lg">
              <p
                className="mt-8 text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold"
                id="LOOK"
              >
                {lookTitle}
              </p>
            </div>
            {heroVideoID ? (
              <iframe
                className="w-full sm:w-3/4 h-[300px] sm:h-screen border-4 sm:border-8 border-black/50 grid-container md:rounded-lg mt-8 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 z-50"
                src={`https://www.youtube.com/embed/${heroVideoID}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <p className="text-white">No video available</p>
            )}
          </div>

          {/* Additional YouTube Videos */}
          <div className="w-screen grid-container px-4 sm:px-12 mt-8 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 z-50">
            {videoPreLink?.vidLink?.map((link, i) => {
              const videoId = extractYouTubeID(link);
              return videoId ? (
                <iframe
                  key={i}
                  className="w-full sm:max-w-4xl h-[250px] sm:h-[450px] mb-8 sm:mb-12 border-4 sm:border-8 border-black/50 md:rounded-lg z-50"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`YouTube video ${i}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  frameBorder="0"
                  allowFullScreen
                />
              ) : null;
            })}
          </div>

          {/* LISTEN Section */}
          <div className="w-full flex mt-8 sm:mt-12 gap-y-8 sm:gap-y-12 flex-col items-center z-50 px-4">
            <div className="mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
              <p
                className="text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold"
                id="LISTEN"
              >
                {listenTitle}
              </p>
            </div>

            <div className="w-full relative z-50 grid grid-cols-1 pb-32 sm:grid-cols-2 gap-16 sm:gap-12 md:gap-16 lg:gap-24 px-4 md:px-8 lg:px-32">
              {albums.map((album, index) => {
                const albumId = album.albumId;
                return (
                  <FlipCard
                    key={albumId}
                    ref={(el) => addFlipCardRef(albumId, el)}
                    album={album}
                    isFlipped={flippedAlbums.has(albumId)}
                    toggleFlip={handleFlip}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </AudioProvider>
);

}
