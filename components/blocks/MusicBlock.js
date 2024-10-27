// components/blocks/MusicBlock.js

import React, { useState, useRef, useCallback, useEffect } from 'react';
import FlipCard from '@components/Music/FlipCard';
import LazyLoad from 'react-lazyload';
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

  // Generate a safe ID from listenTitle without lowercasing
  const listenId = listenTitle
    ? listenTitle.replace(/\s+/g, '-')
    : 'LISTEN';

  return (
    <section
      id={listenId} // Add this line with exact case
      className="w-full px-4 md:px-8 lg:px-32 relative z-10"
    >
      <div className="flex flex-col items-center space-y-8">
        <div className="mt-16 mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
          <p className="text-5xl sm:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold">
            {listenTitle}
          </p>
        </div>

        <Grid columns={{ default: 1, sm: 2 }} gap={32} className="w-full relative z-50 pb-32 px-4 md:px-8 lg:px-32">
          {albums.map((album, index) => (
            <LazyLoad key={album._id || index} height={300} offset={100}>
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
              />
            </LazyLoad>
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
