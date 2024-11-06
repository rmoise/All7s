// components/blocks/MusicBlock.tsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import FlipCard from '@components/Music/FlipCard';
import Grid from '@components/common/Grid/Grid';
import type { Album, Song, MusicBlock as MusicBlockType } from '../../types/sanity';
import { urlFor } from '@/lib/client';

interface MusicBlockProps {
  listenTitle?: string;
  albums?: Album[];
}

const MusicBlock: React.FC<MusicBlockProps> = ({ listenTitle = 'LISTEN', albums = [] }) => {
  const [flippedAlbums, setFlippedAlbums] = useState<Set<string>>(new Set());
  const flipCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleFlip = useCallback((albumId: string) => {
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

  const addFlipCardRef = useCallback((albumId: string, ref: HTMLDivElement | null) => {
    if (ref) {
      flipCardRefs.current[albumId] = ref;
    }
  }, []);

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    let clickedInsideAnyCard = false;

    Object.values(flipCardRefs.current).forEach((cardRef) => {
      if (cardRef && cardRef.contains(e.target as Node)) {
        clickedInsideAnyCard = true;
      }
    });

    if (!clickedInsideAnyCard) {
      setFlippedAlbums(new Set());
    }
  }, []);

  useEffect(() => {
    if (flippedAlbums.size > 0) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [flippedAlbums.size, handleOutsideClick]);

  const listenId = listenTitle ? listenTitle.replace(/\s+/g, '-') : 'LISTEN';

  const getSongs = (album: Album): Song[] => {
    if (album.albumSource === 'custom' && album.customAlbum?.songs) {
      return album.customAlbum.songs;
    }
    if (album.albumSource === 'embedded' && album.embeddedAlbum?.songs) {
      return album.embeddedAlbum.songs;
    }
    return [];
  };

  const getEmbedUrl = (embedCode: string | undefined, platform: string | undefined): string => {
    if (!embedCode) return '';

    if (platform === 'soundcloud') {
      const match = embedCode.match(/src="([^"]+)"/);
      return match ? match[1] : '';
    }

    if (platform === 'spotify') {
      const match = embedCode.match(/src="([^"]+)"/);
      return match ? match[1] : '';
    }

    return '';
  };

  const getImageUrl = (album: Album): string => {
    console.log('Getting image URL for album:', album);

    // For embedded albums with imageUrl (SoundCloud/Spotify)
    if (album.albumSource === 'embedded' && album.embeddedAlbum?.imageUrl) {
      console.log('Using embedded album imageUrl:', album.embeddedAlbum.imageUrl);
      return album.embeddedAlbum.imageUrl;
    }

    // For custom albums or embedded albums with custom image override
    if (album.customAlbum?.customImage?.asset || album.embeddedAlbum?.customImage?.asset) {
      const image = album.customAlbum?.customImage || album.embeddedAlbum?.customImage;
      console.log('Using custom image:', image);
      return urlFor(image).url();
    }

    console.log('Using placeholder image');
    return '/images/placeholder.png';
  };

  return (
    <section id={listenId} className="w-full px-2 sm:px-4 md:px-8 lg:px-32 relative z-10">
      <div className="flex flex-col items-center space-y-8">
        <div className="mt-16 mb-8 sm:mb-12 rounded-lg flex items-center justify-center w-full sm:w-1/2">
          <p className="text-5xl md:text-6xl lg:text-7xl font-Headline text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 font-bold">
            {listenTitle}
          </p>
        </div>

        <Grid columns={1} gap={32} className="w-full max-w-6xl mx-auto pb-32">
          {albums.map((album, index) => {
            if (!album) return null;

            const albumId = album._id || `album-${index}`;
            const embedUrl = getEmbedUrl(
              album.embeddedAlbum?.embedCode,
              album.embeddedAlbum?.platform
            );

            console.log('Extracted Embed URL:', embedUrl);

            return (
              <div key={albumId} className="flex justify-center items-center w-full p-4 mx-auto">
                <FlipCard
                  album={{
                    albumId,
                    title: album.embeddedAlbum?.title || album.customAlbum?.title || 'Untitled Album',
                    artist: album.embeddedAlbum?.artist || album.customAlbum?.artist || 'Unknown Artist',
                    imageUrl: getImageUrl(album),
                    songs: getSongs(album),
                    embedUrl: embedUrl,
                    albumSource: album.embeddedAlbum ? 'embedded' : 'custom',
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

export default MusicBlock;
