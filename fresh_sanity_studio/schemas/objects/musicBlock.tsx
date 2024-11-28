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
      hidden: true,
      initialValue: 'LISTEN'
    }),
    defineField({
      name: 'listenTitle',
      title: 'Listen Title',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'LISTEN'
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
    }),
  ],
  preview: {
    select: {
      albumsRaw: 'albums',
    },
    prepare(selection: Record<string, any>) {
      const {albumsRaw} = selection
      return {
        title: 'Music Block',
        subtitle: `${albumsRaw?.length || 0} albums`,
        media: <MdMusicNote />,
      }
    },
  },
});