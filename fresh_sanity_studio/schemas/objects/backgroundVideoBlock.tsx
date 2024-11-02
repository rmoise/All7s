// schemas/backgroundVideoBlock.js

import { defineType, defineField } from 'sanity';

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
  ],
  preview: {
    select: {
      title: 'backgroundVideoUrl',
      media: 'posterImage',
    },
    prepare(selection) {
      return {
        title: 'Background Video Block',
        media: selection.media || null,
      }
    },
  },
});
