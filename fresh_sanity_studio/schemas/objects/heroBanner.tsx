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
    defineField({
      name: 'smallText',
      title: 'Small Text',
      type: 'string',
    }),
    defineField({
      name: 'midText',
      title: 'Mid Text',
      type: 'string',
    }),
    defineField({
      name: 'largeText1',
      title: 'Large Text',
      type: 'string',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
    }),
    defineField({
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'url',
    }),
    defineField({
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Hero Banner section.',
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Hero Banner section.',
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing for the Hero Banner section.',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'largeText1',
      media: 'backgroundImage',
    },
    prepare({title, media}) {
      return {
        title: title || 'Hero Banner',
        media,
      }
    },
  },
});
