// schemas/home.js

import { defineType, defineField, defineArrayMember } from 'sanity';
import type { DocumentDefinition } from 'sanity';

export default defineType({
  name: 'home',
  type: 'document',
  title: 'Home Page',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Page Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Home Page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Home Page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing on the Home Page',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'contentBlocks',
      type: 'array',
      title: 'Content Blocks',
      of: [
        defineArrayMember({
          type: 'about',
          title: 'About Section',
        }),
        defineArrayMember({
          type: 'heroBanner',
          title: 'Hero Banner Section',
        }),
        defineArrayMember({
          type: 'musicBlock',
          title: 'Music Section',
        }),
        defineArrayMember({
          type: 'videoBlock',
          title: 'Video Section',
        }),
        defineArrayMember({
          type: 'backgroundVideoBlock',
          title: 'Background Video Section',
        }),
        defineArrayMember({
          type: 'newsletter',
          title: 'Newsletter Section',
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Home Page',
      }
    },
  },
}) satisfies DocumentDefinition
