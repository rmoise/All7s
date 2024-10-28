import React, { useState, useRef, useCallback, useEffect } from 'react';
import FlipCard from '@components/Music/FlipCard';
import PropTypes from 'prop-types';
import Grid from '@components/common/Grid/Grid';

const MusicBlock = ({ listenTitle, albums = [] }) => {
  const [flippedAlbums, setFlippedAlbums] = useState(new Set());
  const flipCardRefs = useRef({});

  const handleFlip = useCallback((albumId) => {
    setFlippedAlbums((prev) => {
      const newFlipped = new Set(prev);
      if (newFlipped.has(albumId)) {
        newFlipped.delete(albumId);
      } else {
        newFlipped.add(albumId);
      }
      return newFlipped;
    });
  }, []);

  const addFlipCardRef = useCallback((albumId, ref) => {
    if (ref) {
      flipCardRefs.current[albumId] = ref;
    }
  }, []);

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

  const listenId = listenTitle ? listenTitle.replace(/\s+/g, '-') : 'LISTEN';

  return (
    <section
      id={listenId}
      className="w-full px-4 md:px-8 lg:px-32 relative z-10"
    >
      <div className="flex flex-col items-center space-y-8">
        <div className="mt-16 mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
          <p className="text-5xl md:text-6xl lg:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold">
            {listenTitle}
          </p>
        </div>

        {/* Grid layout with automatic centering and responsive column count */}
        <Grid
          columns={{ default: 1, lg: 2 }} // Stacks to 1 column on mobile/tablet, 2 on larger screens
          gap={32} // Standard gap for card spacing
          className="w-full max-w-6xl mx-auto pb-32" // Auto center the grid on tablet
        >
          {albums.map((album, index) => (
            <div
              key={album._id || index}
              className="flex justify-center items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-4 mx-auto"
            >
              <FlipCard
                album={{
                  albumId: album._id || `album-${index}`,
                  title: album.embeddedAlbum?.title || album.customAlbum?.title || 'Untitled Album',
                  artist: album.embeddedAlbum?.artist || album.customAlbum?.artist || 'Unknown Artist',
                  imageUrl: album.embeddedAlbum?.imageUrl || album.customAlbum?.customImage?.asset?.url || '/images/placeholder.png',
                  songs: album.embeddedAlbum?.songs || album.customAlbum?.songs || [],
                  embedUrl: album.embeddedAlbum?.embedUrl || '',
                }}
                isFlipped={flippedAlbums.has(album._id)}
                toggleFlip={handleFlip}
                addFlipCardRef={addFlipCardRef}
                titleClass="text-xl md:text-2xl lg:text-3xl whitespace-nowrap truncate"
                artistClass="text-lg md:text-xl lg:text-2xl whitespace-nowrap truncate"
              />
            </div>
          ))}
        </Grid>
      </div>
    </section>
  );
};

MusicBlock.propTypes = {
  listenTitle: PropTypes.string.isRequired,
  albums: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      albumSource: PropTypes.string,
      embeddedAlbum: PropTypes.shape({
        title: PropTypes.string,
        artist: PropTypes.string,
        imageUrl: PropTypes.string,
        embedUrl: PropTypes.string,
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
      }),
    })
  ),
};

export default MusicBlock;
