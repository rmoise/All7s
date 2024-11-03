// schemas/musicBlock.tsx
import { defineType, defineField, defineArrayMember } from 'sanity';
import { MdMusicNote } from 'react-icons/md';
import React from 'react';

export default defineType({
  name: 'musicBlock',
  title: 'Music Block',
  type: 'object',
  icon: MdMusicNote,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'albums',
      title: 'Albums',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'album' }],
      }],
      description: 'List of music albums to display',
      validation: Rule =>
        Rule.required().custom((albums) => {
          if (!albums?.length) return 'At least one album is required'
          if (albums.length > 10) return 'Maximum of 10 albums allowed'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      albumsRaw: 'albums',
    },
    prepare(selection: Record<string, any>) {
      const {title, albumsRaw} = selection
      return {
        title: title || 'Music Block',
        subtitle: `${albumsRaw?.length || 0} albums`,
        media: <MdMusicNote />,
      }
    },
  },
});