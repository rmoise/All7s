// schemas/home.js

import { defineType, defineField, defineArrayMember } from 'sanity';

export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      validation: Rule => Rule.required(),
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      validation: Rule => Rule.required(),
      of: [
        defineArrayMember({ type: 'heroBanner' }),
        defineArrayMember({ type: 'splash' }),
        defineArrayMember({ type: 'about' }),
        defineArrayMember({ type: 'musicBlock' }),
        defineArrayMember({ type: 'videoBlock' }),
        defineArrayMember({ type: 'backgroundVideoBlock' }),
        defineArrayMember({ type: 'newsletter' })
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'Home',
      }
    },
  },
})
