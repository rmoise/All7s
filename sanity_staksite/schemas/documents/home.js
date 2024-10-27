// schemas/home.js

import { defineType } from 'sanity';

export default defineType({
  name: 'home',
  type: 'document',
  title: 'Home Page',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Page Title',
      validation: Rule => Rule.required(),
    },
    {
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Home Page',
      validation: Rule => Rule.required(),
    },
    {
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Home Page',
      validation: Rule => Rule.required(),
    },
    {
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing on the Home Page',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'contentBlocks',
      type: 'array',
      title: 'Content Blocks',
      of: [
        {
          type: 'about',
          title: 'About Section',
        },
        {
          type: 'heroBanner',
          title: 'Hero Banner Section',
        },
        {
          type: 'musicBlock',
          title: 'Music Section',
        },
        {
          type: 'videoBlock',
          title: 'Video Section',
        },
        {
          type: 'backgroundVideoBlock',
          title: 'Background Video Section',
        },
        {
          type: 'newsletter',
          title: 'Newsletter Section',
        },
        // Add other block types as needed
      ],
      validation: Rule => Rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Home Page',
      };
    },
  },
});
