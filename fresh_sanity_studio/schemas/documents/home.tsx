// schemas/home.js

import { defineType, defineField, defineArrayMember } from 'sanity';

interface PreviewSelection {
  title?: string
}

interface HomeSchema {
  name: string
  title: string
  type: 'document'
  __experimental_actions: Array<'update' | 'publish'>
  fields: any[]
  preview: {
    select: {
      title: string
    }
    prepare(selection: PreviewSelection): { title: string }
  }
  views?: any[]
}

const home = defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
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
      of: [
        { type: 'splash' },
        { type: 'about' },
        { type: 'musicBlock' },
        { type: 'videoBlock' },
        { type: 'backgroundVideoBlock' },
        { type: 'newsletter' },
        { type: 'heroBanner' },
      ].map(type => defineArrayMember(type)),
    }),
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare(selection: PreviewSelection) {
      return {
        title: selection.title || 'Home'
      }
    }
  }
} as HomeSchema)

export default home;
