import { defineType } from 'sanity';

export default defineType({
  name: 'homePage',
  type: 'document',
  title: 'Home Page',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Page Title',
    },
    {
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Home Page.',
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Home Page.',
    },
    {
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing on the Home Page.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'contentBlocks',
      type: 'array',
      title: 'Content Blocks',
      of: [
        {
          type: 'about',
          preview: {
            prepare() {
              return {
                title: 'About Section',
              };
            },
          },
        },
        {
          type: 'heroBanner',
          preview: {
            prepare() {
              return {
                title: 'Hero Banner Section',
              };
            },
          },
        },
        {
          type: 'musicAndVideo',
          preview: {
            prepare() {
              return {
                title: 'Music and Video Section',
              };
            },
          },
        },
        {
          type: 'newsletter',
          preview: {
            select: {
              title: 'heading',
            },
            prepare(selection) {
              const { title } = selection;
              return {
                title: title || 'Newsletter Section',
              };
            },
          },
        },
      ],
    },
  ],
});
