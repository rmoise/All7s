import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'heroBanner',
  title: 'Hero Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      media: 'backgroundImage'
    },
    prepare({ media }) {
      return {
        title: 'Hero Block',
        subtitle: 'Hero banner with background image',
        media: media
      };
    },
  },
});
