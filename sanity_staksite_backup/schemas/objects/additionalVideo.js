// schemas/additionalVideo.js
import { defineType } from 'sanity';

export default defineType({
  name: 'additionalVideo',
  title: 'Additional Video',
  type: 'object',
  fields: [
    {
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: Rule => Rule.uri({ scheme: ['http', 'https'] }).required(),
    },
  ],
  preview: {
    select: {
      title: 'url',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Additional Video',
        media: null, // Optionally, you can add a preview image or icon
      };
    },
  },
});
