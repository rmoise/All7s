// schemas/videoBlock.js
import { defineType } from 'sanity';
/* eslint-disable @typescript-eslint/no-unused-vars */
import additionalVideo from './additionalVideo'; // Import the additionalVideo schema

export default defineType({
  name: 'videoBlock',
  title: 'Video Block',
  type: 'object',
  fields: [
    {
      name: 'lookTitle',
      title: 'Look Section Title',
      type: 'string',
      description: 'Title for the Look section',
      validation: Rule => Rule.required(),
    },
    {
      name: 'heroVideoLink',
      title: 'Hero Video Link',
      type: 'url',
      description: 'URL of the hero video (e.g., YouTube or Vimeo)',
      validation: Rule => Rule.uri({ scheme: ['http', 'https'] }).required(),
    },
    {
      name: 'additionalVideos',
      title: 'Additional Video Links',
      type: 'array',
      of: [{ type: 'additionalVideo' }], // Use the additionalVideo object
      description: 'List of additional video links',
      validation: Rule => Rule.required().min(1).error('At least one video link is required'),
    },
  ],
  preview: {
    select: {
      title: 'lookTitle',
      media: 'heroVideoLink',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Video Block',
        media: null, // You can customize this to show a thumbnail if desired
      };
    },
  },
});
