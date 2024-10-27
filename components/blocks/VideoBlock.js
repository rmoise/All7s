// components/blocks/VideoBlock.js

import React from 'react';
import PropTypes from 'prop-types';
import YouTubeEmbed from '@components/media/YouTubeEmbed';
import LazyLoad from 'react-lazyload';
import { extractYouTubeID } from '@utils/extractYouTubeID';
import Grid from '@components/common/Grid/Grid';

const VideoBlock = ({ lookTitle = 'Video Gallery', heroVideoLink = '', additionalVideos = [] }) => {
  const heroVideoID = extractYouTubeID(heroVideoLink);

  // Generate a safe ID from lookTitle without lowercasing
  const lookId = lookTitle
    ? lookTitle.replace(/\s+/g, '-')
    : 'LOOK';

  return (
    <section
      id={lookId} // Add this line with exact case
      className="relative z-10 w-full px-4 md:px-8 lg:px-16 py-16"
    >
      <div className="flex flex-col items-center justify-center mb-8 px-4 md:px-8 lg:px-16">
        <div className="mb-16 rounded-lg w-full text-center">
          <p className="mt-8 text-6xl font-Headline bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 text-transparent font-bold">
            {lookTitle}
          </p>
        </div>
        {heroVideoID && (
          <div className="w-full mb-8">
            <YouTubeEmbed
              embedId={heroVideoID}
              title="Hero YouTube video"
              className="border-8 border-black/50 rounded-lg"
            />
          </div>
        )}
      </div>
      <Grid
        columns={{ default: 1, sm: 1, lg: 2 }} // 1 column on mobile and small screens, 2 on large
        gap={32} // 32px gap (gap-8 in Tailwind)
        className="px-4 md:px-8 lg:px-16"
      >
        {additionalVideos.map((videoObj, i) => {
          const videoId = extractYouTubeID(videoObj.url);
          return videoId ? (
            <div key={`vid-${i}`} className="w-full">
              <LazyLoad height={200} offset={100}>
                <YouTubeEmbed
                  embedId={videoId}
                  title={`YouTube video ${i + 1}`}
                  className="border-8 border-black/50 rounded-lg"
                />
              </LazyLoad>
            </div>
          ) : null;
        })}
      </Grid>
    </section>
  );
};

VideoBlock.propTypes = {
  lookTitle: PropTypes.string,
  heroVideoLink: PropTypes.string,
  additionalVideos: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
    })
  ),
};

export default VideoBlock;
