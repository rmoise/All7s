import { defineType } from 'sanity';

export default defineType({
  name: 'heroBanner',
  title: 'Hero Banner Section',
  type: 'object',
  fields: [
    {
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {
        hotspot: true, // Enables image cropping
      },
    },
    {
      name: 'smallText',
      title: 'Small Text',
      type: 'string',
    },
    {
      name: 'midText',
      title: 'Mid Text',
      type: 'string',
    },
    {
      name: 'largeText1',
      title: 'Large Text',
      type: 'string',
    },
    {
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
    },
    {
      name: 'ctaLink',
      title: 'CTA Link',
      type: 'url',
    },
    // Add SEO Fields
    {
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Hero Banner section.',
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Hero Banner section.',
    },
    {
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing for the Hero Banner section.',
      options: {
        hotspot: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'largeText1',
      media: 'backgroundImage',
    },
    prepare(selection) {
      const { title, media } = selection;
      return {
        title: title || 'Hero Banner Section',
        media,
      };
    },
  },
});
