// schemas/objects/album.tsx

import React from 'react';
import { defineType, defineField, StringInputProps, StringSchemaType } from 'sanity';
import EmbedUrlInput from '../../components/EmbedUrlInput';

// Wrapper component to provide the additional props EmbedUrlInput needs
const EmbedUrlInputWrapper: React.FC<StringInputProps<StringSchemaType>> = (props) => {
  const onSetFieldValue = (field: string, value: string | null) => {
    // Implement the logic to set other fields in your document
    // This might involve using Sanity's client to patch the document
    console.log(`Setting ${field} to ${value}`);
    // You might want to use the Sanity client here to update the document
    // For example:
    // client.patch(props.document._id).set({[field]: value}).commit()
  };

  return (
    <EmbedUrlInput
      {...props}
      onSetFieldValue={onSetFieldValue}
    />
  );
};

export default defineType({
  name: 'album',
  title: 'Album or Single Release',
  type: 'document',
  fields: [
    defineField({
      name: 'embedUrl',
      title: 'Embed URL',
      type: 'string',
      components: {
        input: EmbedUrlInputWrapper
      }
    }),
    defineField({
      name: 'title',
      title: 'Release Title',
      type: 'string',
      description: 'Enter the title of the album or single.',
    }),
    defineField({
      name: 'artist',
      title: 'Artist',
      type: 'string',
      initialValue: 'Stak',
      description: 'Name of the artist. Defaults to Stak but can be changed if needed.',
    }),
    defineField({
      name: 'spotifyTitle',
      title: 'Spotify Title',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'spotifyArtist',
      title: 'Spotify Artist',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'releaseType',
      title: 'Release Type',
      type: 'string',
      options: {
        list: [
          { title: 'Album', value: 'album' },
          { title: 'Single', value: 'single' },
        ],
      },
      description: 'Select whether this is an album or a single release.',
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Spotify', value: 'spotify' },
          { title: 'SoundCloud', value: 'soundcloud' },
        ],
      },
      description: 'Choose the platform where this release is hosted.',
    }),
    defineField({
      name: 'customImage',
      title: 'Custom Album Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optional: Add a custom photo for the album or to override the default cover from Spotify or SoundCloud.',
    }),
    defineField({
      name: 'songs',
      title: 'Songs',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'song',
          fields: [
            defineField({
              name: 'trackTitle',
              title: 'Track Title',
              type: 'string',
              description: 'Enter the title of the individual track.',
            }),
            defineField({
              name: 'file',
              title: 'Audio File',
              type: 'file',
              options: {
                accept: 'audio/*',
              },
              description: 'Upload the audio file for this track (if available).',
            }),
          ],
        },
      ],
      description: 'Add individual tracks for this release. You can reorder them by dragging.',
    }),
  ],
  preview: {
    select: {
      title: 'spotifyTitle',
      artist: 'spotifyArtist',
      customImage: 'customImage',
      releaseType: 'releaseType',
    },
    prepare(selection) {
      const { title, artist, customImage, releaseType } = selection;
      return {
        title: title || 'Untitled Release',
        subtitle: `${releaseType || 'Release'} by ${artist || 'Unknown Artist'}`,
        media: customImage,
      };
    },
  },
});
