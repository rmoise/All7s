// components/blocks/MusicBlock.js

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

  const handleOutsideClick = useCallback(
    (e) => {
      let clickedInsideAnyCard = false;

      Object.values(flipCardRefs.current).forEach((cardRef) => {
        if (cardRef && cardRef.contains(e.target)) {
          clickedInsideAnyCard = true;
        }
      });

      if (!clickedInsideAnyCard) {
        setFlippedAlbums(new Set());
      }
    },
    []
  );

  useEffect(() => {
    if (flippedAlbums.size > 0) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [flippedAlbums.size, handleOutsideClick]);

  const listenId = listenTitle ? listenTitle.replace(/\s+/g, '-') : 'LISTEN';

  return (
    <section
      id={listenId}
      className="w-full px-2 sm:px-4 md:px-8 lg:px-32 relative z-10"
    >
      <div className="flex flex-col items-center space-y-8">
        <div className="mt-16 mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
          <p className="text-5xl md:text-6xl lg:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold">
            {listenTitle}
          </p>
        </div>

        {/* Stacked layout for cards */}
        <Grid
          columns={1}
          gap={32}
          className="w-full max-w-6xl mx-auto pb-32"
        >
          {albums.map((album, index) => {
  if (!album) return null; // Skip if album is null or undefined

  const albumId = album._id || `album-${index}`;
  return (
    <div
      key={albumId}
      className="flex justify-center items-center w-full p-4 mx-auto"
    >
      <FlipCard
        album={{
          albumId,
          title:
            album.embeddedAlbum?.title ||
            album.customAlbum?.title ||
            'Untitled Album',
          artist:
            album.embeddedAlbum?.artist ||
            album.customAlbum?.artist ||
            'Unknown Artist',
          imageUrl:
            album.embeddedAlbum?.imageUrl ||
            album.customAlbum?.customImage?.asset?.url ||
            '/images/placeholder.png',
          songs:
            album.embeddedAlbum?.songs ||
            album.customAlbum?.songs ||
            [],
          embedUrl: album.embeddedAlbum?.embedUrl || '',
        }}
        isFlipped={flippedAlbums.has(albumId)}
        toggleFlip={handleFlip}
        addFlipCardRef={addFlipCardRef}
        titleClass="text-xl md:text-2xl lg:text-3xl whitespace-nowrap truncate"
        artistClass="text-lg md:text-xl lg:text-2xl whitespace-nowrap truncate"
      />
    </div>
  );
})}

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
