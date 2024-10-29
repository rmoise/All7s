// components/blocks/VideoBlock.js

import React from 'react';
import PropTypes from 'prop-types';
import YouTubeEmbed from '@components/media/YouTubeEmbed';
import Grid from '@components/common/Grid/Grid';
import { extractYouTubeID } from '@utils/extractYouTubeID';

const VideoBlock = ({ lookTitle = 'Video Gallery', heroVideoLink = '', additionalVideos = [] }) => {
  const heroVideoID = extractYouTubeID(heroVideoLink);
  const lookId = lookTitle ? lookTitle.replace(/\s+/g, '-') : 'LOOK';

  return (
    <section id={lookId} className="relative z-10 w-full px-4 md:px-8 lg:px-16 py-16">
      <div className="flex flex-col items-center justify-center mb-8 px-4 md:px-8 lg:px-16">
        <h2 className="mb-16 rounded-lg w-full text-center mt-8 text-6xl font-Headline bg-clip-text bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 text-transparent font-bold">
          {lookTitle}
        </h2>
        {heroVideoID && (
          <YouTubeEmbed
            embedId={heroVideoID}
            title="Hero YouTube video"
            className="border-8 mb-32 border-black/50 rounded-lg"
          />
        )}
      </div>
      <Grid columns={{ default: 1, sm: 1, lg: 2 }} gap={32} className="px-4 md:px-8 lg:px-16">
        {additionalVideos.map((videoObj, i) => {
          const videoId = extractYouTubeID(videoObj.url);
          return videoId ? (
            <YouTubeEmbed
              key={`vid-${i}`}
              embedId={videoId}
              title={`YouTube video ${i + 1}`}
              className="border-8 border-black/50 rounded-lg"
            />
          ) : null;
        })}
      </Grid>
    </section>
  );
};

VideoBlock.propTypes = {
  lookTitle: PropTypes.string,
  heroVideoLink: PropTypes.string,
  additionalVideos: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string.isRequired })),
};

export default VideoBlock;
