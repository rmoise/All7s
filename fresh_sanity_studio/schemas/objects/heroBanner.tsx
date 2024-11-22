import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'heroBanner',
  title: 'Hero Banner',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Button Text',
          type: 'string',
        },
        {
          name: 'link',
          title: 'Button Link',
          type: 'url',
        },
      ],
    }),
  ],
  preview: {
    select: {
      media: 'backgroundImage'
    },
    prepare({ media }) {
      return {
        title: 'Hero Block',
        subtitle: 'Hero banner with background image and CTA',
        media: media
      };
    },
  },
});
