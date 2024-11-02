// schemas/home.js

import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'home',
  type: 'document',
  title: 'Home Page',
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Page Title',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      type: 'string',
      title: 'Meta Title',
      description: 'SEO title for the Home Page',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'metaDescription',
      type: 'text',
      title: 'Meta Description',
      description: 'SEO meta description for the Home Page',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image for social sharing on the Home Page',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'contentBlocks',
      type: 'array',
      title: 'Content Blocks',
      of: [
        defineArrayMember({
          type: 'blockContent'
        }),
        defineArrayMember({
          type: 'musicBlock'
        }),
        defineArrayMember({
          type: 'videoBlock'
        }),
        defineArrayMember({
          type: 'backgroundVideoBlock'
        })
      ],
      options: {
        editModal: 'fullscreen'
      },
      validation: Rule => Rule.required().min(1),
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
});
