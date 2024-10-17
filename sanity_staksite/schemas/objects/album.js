// schemas/album.js

import { defineType } from 'sanity';

export default defineType({
  name: 'album',
  title: 'Album or Single Release',
  type: 'document',
  initialValue: {
    artist: 'Stak', // Set "Stak" as the default artist for new albums
  },
  fields: [
    {
      name: 'title',
      title: 'Release Title',
      type: 'string',
      description: 'The title of the album or single.',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'string',
      description: 'A brief description of the album or single.',
    },
    {
      name: 'releaseType',
      title: 'Release Type',
      type: 'string',
      options: {
        list: [
          { title: 'Album', value: 'album' },
          { title: 'Single', value: 'single' },
        ],
      },
      description: 'Select whether this is an album or a single song release.',
    },
    {
      name: 'artist',
      title: 'Artist',
      type: 'string',
      description: 'The artist name for this release. Default is Stak.',
      initialValue: 'Stak', // Pre-fill the artist name as "Stak"
    },
    {
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'string',
      description: 'The embed URL for Spotify or SoundCloud. Make sure to use the embed version of the link.',
    },
    {
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Spotify', value: 'spotify' },
          { title: 'SoundCloud', value: 'soundcloud' },
        ],
      },
      description: 'The platform where the release is hosted (Spotify or SoundCloud).',
    },
    {
      name: 'customImage',
      title: 'Custom Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Custom cover image for the release (optional). This will override the default cover from Spotify or SoundCloud.',
    },
    {
      name: 'songs',
      title: 'Uploaded Songs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'song',
          title: 'Song',
          fields: [
            {
              name: 'trackTitle',
              title: 'Track Title',
              type: 'string',
              description: 'The title of the track.',
            },
            {
              name: 'file',
              title: 'Audio File',
              type: 'file',
              options: {
                accept: 'audio/*',
              },
              description: 'Upload the audio file for this track.',
            },
            {
              name: 'duration',
              title: 'Duration (seconds)',
              type: 'number',
              description: 'Duration of the track in seconds.',
            },
          ],
        },
      ],
      description: 'Upload individual song files for the release (optional). Each song can have its own title and duration.',
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'customImage',
    },
    prepare(selection) {
      const { title, media } = selection;
      return {
        title: title || 'Album or Single Release',
        media,
      };
    },
  },
});
