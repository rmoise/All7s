// components/blocks/BackgroundVideoBlock.js

import React from 'react';
import PropTypes from 'prop-types';

const BackgroundVideoBlock = ({
  backgroundVideoUrl = '',
  backgroundVideoFile = null,
  posterImage = null,
}) => {
  const videoSrc = backgroundVideoFile?.asset?.url || backgroundVideoUrl;

  if (!videoSrc) return null;

  return (
    <div className="sticky top-0 w-full h-[56.25vw] max-h-screen overflow-hidden bg-black z-0">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src={videoSrc}
        poster={posterImage?.asset?.url || '/images/default-poster.png'}
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

BackgroundVideoBlock.propTypes = {
  backgroundVideoUrl: PropTypes.string,
  backgroundVideoFile: PropTypes.shape({
    asset: PropTypes.shape({
      url: PropTypes.string,
    }),
  }),
  posterImage: PropTypes.shape({
    asset: PropTypes.shape({
      url: PropTypes.string,
    }),
  }),
};

export default BackgroundVideoBlock;
