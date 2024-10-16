import { defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title of your website.',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a favicon for your website.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'seo',  // Changed from 'defaultSeo' to 'seo'
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Default meta title for pages if not specifically defined.',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Default meta description for pages if not specifically defined.',
        },
        {
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Default image for social sharing.',
          options: {
            hotspot: true,
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'favicon',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Site Settings',
        media,
      };
    },
  },
});
