import { defineType } from 'sanity';

export default defineType({
  name: 'heroBanner',
  type: 'document',
  title: 'Hero Banner',
  fields: [
    {
      name: 'smallText',
      type: 'string',
      title: 'Small Text',
      description: 'Small text above the main heading',
    },
    {
      name: 'midText',
      type: 'string',
      title: 'Middle Text',
      description: 'Text for the middle heading',
    },
    {
      name: 'largeText1',
      type: 'string',
      title: 'Large Text',
      description: 'Main heading of the hero banner',
    },
    {
      name: 'backgroundImage',
      type: 'image',
      title: 'Background Image',
      options: {
        hotspot: true,
      },
      description: 'Background image for the hero banner',
    },
    {
      name: 'ctaText',
      type: 'string',
      title: 'Call to Action Text',
    },
    {
      name: 'ctaLink',
      type: 'url',
      title: 'Call to Action Link',
    },
    // Add SEO Fields
    {
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Hero Banner page or section.',
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Hero Banner page or section.',
    },
    {
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing for the Hero Banner page or section.',
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
    prepare({ title, media }) {
      return {
        title: title || 'Hero Banner',
        media,
      };
    },
  },
});
