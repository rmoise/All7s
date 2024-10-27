import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavbar } from '@context/NavbarContext';
import { AudioProvider } from '@context/AudioContext';
import Videos from '@components/media/Videos';
import Music from '@components/Music/Music';
import BackgroundVideo from '@components/Music/BackgroundVideo';
import debounce from 'lodash/debounce';
import { YouTubeAPIProvider } from '@components/media/YouTubeAPIProvider';
import { extractYouTubeID } from '@utils/extractYouTubeID';
import PropTypes from 'prop-types';
import YouTubeEmbed from '@components/media/YouTubeEmbed';
import ErrorBoundary from '@components/ErrorBoundary';

export default function MusicAndVideo({ videoPreLink = {} }) {
  const [albums, setAlbums] = useState([]);
  const [flippedAlbums, setFlippedAlbums] = useState(new Set());
  const { setNavbarData } = useNavbar();
  const flipCardRefs = useRef({});

  const heroLink = videoPreLink?.heroLink || '';
  const heroVideoID = extractYouTubeID(heroLink);
  const lookTitle = videoPreLink?.lookTitle || 'VIDEOS';
  const listenTitle = videoPreLink?.listenTitle || 'MUSIC';
  const backgroundVideoFileUrl = videoPreLink?.backgroundVideo?.backgroundVideoFile?.asset?.url;
  const backgroundVideoUrl = backgroundVideoFileUrl || videoPreLink?.backgroundVideo?.backgroundVideoUrl;

  const lookId = lookTitle.replace(/\s+/g, '-');
  const listenId = listenTitle.replace(/\s+/g, '-');

  // Update Navbar links
  useEffect(() => {
    if (setNavbarData) {
      setNavbarData((prevData) => {
        const updatedNavigationLinks = prevData.navigationLinks
          .filter((link) => link.name !== lookTitle && link.name !== listenTitle)
          .concat(
            { name: lookTitle, href: `/#${lookId}` },
            { name: listenTitle, href: `/#${listenId}` }
          );

        return { ...prevData, navigationLinks: updatedNavigationLinks };
      });
    }
  }, [lookTitle, listenTitle, setNavbarData, lookId, listenId]);

  const fetchAlbumData = useCallback(async () => {
    if (videoPreLink?.musicLink) {
      const processedAlbums = videoPreLink.musicLink.map((album, index) => {
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
  }, [videoPreLink]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  const debouncedFetchAlbumData = useMemo(() => debounce(fetchAlbumData, 300), [fetchAlbumData]);

  useEffect(() => {
    debouncedFetchAlbumData();
    return () => debouncedFetchAlbumData.cancel();
  }, [debouncedFetchAlbumData]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFlip = useCallback(
    (albumId) => {
      setFlippedAlbums((prev) => {
        const newFlipped = new Set(prev);
        if (newFlipped.has(albumId)) {
          newFlipped.delete(albumId);
        } else {
          newFlipped.add(albumId);
        }
        return newFlipped;
      });
    },
    []
  );

  const handleOutsideClick = useCallback((e) => {
    const clickedOutside = Object.keys(flipCardRefs.current).every(
      (albumId) => flipCardRefs.current[albumId] && !flipCardRefs.current[albumId].contains(e.target)
    );

    if (clickedOutside) {
      setFlippedAlbums(new Set());
    }
  }, []);

  useEffect(() => {
    if (flippedAlbums.size > 0) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => document.removeEventListener('click', handleOutsideClick);
  }, [flippedAlbums, handleOutsideClick]);

  return (
    <AudioProvider>
      <YouTubeAPIProvider>
        <div className="relative min-h-screen bg-black">
          {backgroundVideoUrl && (
            <BackgroundVideo
              src={backgroundVideoUrl}
              poster={videoPreLink?.backgroundVideo?.posterImage?.asset?.url || ''}
            />
          )}
          <div className="relative z-10">
            <div className="flex flex-col items-center justify-center mb-16 sm:mb-24 w-full px-4 sm:px-12">
              <div className="mb-8 sm:mb-16 rounded-lg w-full text-center">
                <p
                  className="mt-8 text-5xl sm:text-7xl font-Headline bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 text-transparent font-bold"
                  id={lookId}
                >
                  {lookTitle}
                </p>
              </div>
              {heroVideoID && (
                <div className="w-full max-w-[1064px]">
                  <ErrorBoundary>
                    <YouTubeEmbed
                      embedId={heroVideoID}
                      title="Hero YouTube video"
                      className="border-4 sm:border-8 border-black/50 md:rounded-lg"
                      size="hero"
                    />
                  </ErrorBoundary>
                </div>
              )}
            </div>
            <Videos vidLinks={videoPreLink?.vidLink} />
            <Music
              id={listenId}
              albums={albums}
              flippedAlbums={flippedAlbums}
              handleFlip={handleFlip}
              addFlipCardRef={(albumId, ref) => {
                if (ref) flipCardRefs.current[albumId] = ref;
              }}
              listenTitle={listenTitle}
            />
          </div>
        </div>
      </YouTubeAPIProvider>
    </AudioProvider>
  );
}

MusicAndVideo.propTypes = {
  videoPreLink: PropTypes.shape({
    heroLink: PropTypes.string,
    lookTitle: PropTypes.string,
    listenTitle: PropTypes.string,
    backgroundVideo: PropTypes.shape({
      backgroundVideoFile: PropTypes.shape({
        asset: PropTypes.shape({
          url: PropTypes.string,
        }),
      }),
      backgroundVideoUrl: PropTypes.string,
      posterImage: PropTypes.shape({
        asset: PropTypes.shape({
          url: PropTypes.string,
        }),
      }),
    }),
    vidLink: PropTypes.arrayOf(PropTypes.string),
    musicLink: PropTypes.arrayOf(
      PropTypes.shape({
        albumSource: PropTypes.string.isRequired,
        _id: PropTypes.string,
        embeddedAlbum: PropTypes.shape({
          embedUrl: PropTypes.string,
          title: PropTypes.string,
          artist: PropTypes.string,
          imageUrl: PropTypes.string,
          platform: PropTypes.string,
          releaseType: PropTypes.string,
          customImage: PropTypes.string,
        }),
        customAlbum: PropTypes.shape({
          title: PropTypes.string,
          artist: PropTypes.string,
          customImage: PropTypes.shape({
            asset: PropTypes.shape({
              url: PropTypes.string,
            }),
          }),
          songs: PropTypes.arrayOf(
            PropTypes.shape({
              trackTitle: PropTypes.string,
              url: PropTypes.string,
              duration: PropTypes.number,
            })
          ),
          releaseType: PropTypes.string,
        }),
      })
    ),
  }),
};
