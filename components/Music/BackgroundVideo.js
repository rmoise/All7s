// components/BackgroundVideo.js

import React from 'react';
import PropTypes from 'prop-types';

const BackgroundVideo = ({ src, poster = '' }) => (
  <div className="sticky top-0 w-full h-[40vh] sm:h-screen z-0 overflow-hidden pointer-events-none">
    <video
      className="w-full h-full object-cover"
      src={src}
      poster={poster}
      muted
      autoPlay
      loop
      playsInline
      controls={false}
      preload="auto"
    />
  </div>
);

BackgroundVideo.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
};

export default BackgroundVideo;
