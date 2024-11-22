// schemas/backgroundVideoBlock.js

import { defineType, defineField } from 'sanity';
import { MdOndemandVideo } from 'react-icons/md';

// Define the parent type with both possible fields
interface BackgroundVideoParent {
  backgroundVideoFile?: {
    _type: string;
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  backgroundVideoUrl?: string;
}

export default defineType({
  name: 'backgroundVideoBlock',
  title: 'Background Video Block',
  type: 'object',
  fields: [
    defineField({
      name: 'backgroundVideoUrl',
      title: 'Background Video URL',
      type: 'url',
      description: 'URL for the background video (e.g., YouTube)',
      hidden: ({ parent }: { parent: BackgroundVideoParent }) =>
        Boolean(parent?.backgroundVideoFile),
      validation: Rule => Rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'backgroundVideoFile',
      title: 'Background Video File',
      type: 'file',
      options: {
        accept: 'video/*'
      },
      description: 'Upload a video file for the background',
      hidden: ({ parent }: { parent: BackgroundVideoParent }) =>
        Boolean(parent?.backgroundVideoUrl),
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster Image',
      type: 'image',
      description: 'Preview image for the video block',
      options: {
        hotspot: true
      }
    }),
  ],
  preview: {
    select: {
      media: 'posterImage',
      videoUrl: 'backgroundVideoUrl',
      videoFile: 'backgroundVideoFile'
    },
    prepare({ media, videoUrl, videoFile }) {
      return {
        title: 'Background Video Block',
        subtitle: videoUrl || (videoFile ? 'Uploaded video file' : 'No video selected'),
        media: media || <MdOndemandVideo style={{ fontSize: 30 }} />
      }
    }
  },
});
