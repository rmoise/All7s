// schemas/musicBlock.js
import { defineType } from 'sanity';

export default defineType({
  name: 'musicBlock',
  title: 'Music Block',
  type: 'object',
  fields: [
    {
      name: 'listenTitle',
      title: 'Listen Section Title',
      type: 'string',
      description: 'Title for the Listen section',
      validation: Rule => Rule.required(),
    },
    {
      name: 'albums',
      title: 'Albums',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'album' }] }],
      description: 'List of music albums to display',
      validation: Rule => Rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'listenTitle',
      media: 'albums.0.image', // Assumes each album has an image
    },
    prepare(selection) {
      return {
        title: selection.title || 'Music Block',
        media: selection.media || null,
      };
    },
  },
});