// components/blocks/BackgroundVideoBlock.tsx

import React from 'react';
import { client } from '@/lib/client';

interface BackgroundVideoBlockProps {
  backgroundVideoUrl?: string;
  backgroundVideoFile?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };
  posterImage?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };
}

const BackgroundVideoBlock: React.FC<BackgroundVideoBlockProps> = ({
  backgroundVideoUrl,
  backgroundVideoFile,
  posterImage,
}) => {
  // Get the video source
  const videoSrc = React.useMemo(() => {
    // First try to get direct URL
    if (backgroundVideoFile?.asset?.url) {
      return backgroundVideoFile.asset.url;
    }

    // Then try to construct URL from _ref
    if (backgroundVideoFile?.asset?._ref) {
      const fileRef = backgroundVideoFile.asset._ref;
      return `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${fileRef.replace('file-', '').replace('-mp4', '.mp4')}`;
    }

    // Finally fall back to URL field
    return backgroundVideoUrl;
  }, [backgroundVideoFile, backgroundVideoUrl]);

  // Get the poster image
  const posterSrc = React.useMemo(() => {
    // First try to get direct URL
    if (posterImage?.asset?.url) {
      return posterImage.asset.url;
    }

    // Then try to construct URL from _ref
    if (posterImage?.asset?._ref) {
      const imageRef = posterImage.asset._ref;
      return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${imageRef.replace('image-', '').replace('-jpg', '.jpg')}`;
    }

    // Finally fall back to default
    return '/images/default-poster.png';
  }, [posterImage]);

  // Add debug logging
  console.log('Video Source:', videoSrc);
  console.log('Poster Source:', posterSrc);

  if (!videoSrc) return null;

  return (
    <div className="sticky top-0 w-full h-[56.25vw] max-h-screen overflow-hidden bg-black z-0">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={videoSrc}
        poster={posterSrc}
        muted
        autoPlay
        loop
        playsInline
        controls={false}
        preload="auto"
      />
    </div>
  );
};

export default BackgroundVideoBlock;
