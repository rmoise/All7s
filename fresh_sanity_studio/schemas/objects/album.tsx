// album.tsx

import React from 'react';
import { defineType, defineField } from 'sanity';
import ReleaseInfoInput from '../../components/ReleaseInfoInput';
import { urlFor } from '../../utils/imageUrlBuilder';

// Define the same types as in ReleaseInfoInput
interface SanityAssetReference {
  _ref: string;
  _type: 'reference';
}

interface SanityImageType {
  _type: 'image';
  asset: SanityAssetReference;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

interface EmbeddedAlbumValue {
  embedCode?: string;
  customImage?: SanityImageType;
  isEmbedSupported?: boolean;
}

interface ObjectField {
  name: string;
  type: { name: string };
}

interface SchemaType {
  fields?: ObjectField[];
}

type Props = {
  value?: EmbeddedAlbumValue;
  onChange: (patch: any) => void;
  readOnly?: boolean;
  schemaType: SchemaType;
  renderDefault: (props: any) => React.ReactElement;
}

// Define the component using the exact same Props type
const MyComponent = (props: Props) => {
  return <ReleaseInfoInput {...props} />;
};

MyComponent.displayName = 'MyComponent';

export default defineType({
  name: 'album',
  title: 'Album or Single Release',
  type: 'document',
  fields: [
    defineField({
      name: 'albumSource',
      title: 'Album Source',
      type: 'string',
      options: {
        list: [
          {title: 'Embedded Album (Spotify/SoundCloud)', value: 'embedded'},
          {title: 'Custom Album', value: 'custom'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
      initialValue: 'embedded',
    }),
    defineField({
      name: 'embeddedAlbum',
      title: 'Embedded Album Info',
      type: 'object',
      components: {
        input: MyComponent
      },
      fields: [
        defineField({
          name: 'embedCode',
          title: 'Embed Code',
          type: 'text', // Changed to 'text' which automatically provides textarea functionality
          description: 'Enter Spotify or SoundCloud URL or iframe embed code',
          readOnly: false, // Ensure this is set
          validation: (Rule) =>
            Rule.custom((embedCode) => {
              if (!embedCode || !embedCode.trim()) return 'Embed code is required'

              const embedString = embedCode.trim()
              const lowerCaseEmbedCode = embedString.toLowerCase()

              // Check for iframe with SoundCloud or Spotify URLs
              if (
                lowerCaseEmbedCode.includes('<iframe') &&
                (lowerCaseEmbedCode.includes('soundcloud.com') ||
                  lowerCaseEmbedCode.includes('spotify.com'))
              ) {
                return true
              }

              // Check for direct URLs
              const isValidUrl =
                embedString.startsWith('http://') || embedString.startsWith('https://')
              const isSpotifyUrl = lowerCaseEmbedCode.includes('spotify.com')
              const isSoundCloudUrl = lowerCaseEmbedCode.includes('soundcloud.com')

              if (isValidUrl && (isSpotifyUrl || isSoundCloudUrl)) {
                return true
              }

              return 'Please provide a valid Spotify/SoundCloud URL or iframe embed code'
            }),
        }),
        defineField({name: 'title', title: 'Release Title', type: 'string', readOnly: true}),
        defineField({name: 'artist', title: 'Artist', type: 'string', readOnly: true}),
        defineField({name: 'platform', title: 'Platform', type: 'string', readOnly: true}),
        defineField({name: 'releaseType', title: 'Release Type', type: 'string', readOnly: true}),
        defineField({
          name: 'imageUrl',
          title: 'Album Image URL',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({scheme: ['http', 'https']}).warning('Ensure image URL is an external link.'),
        }),
        defineField({
          name: 'customImage',
          title: 'Custom Album Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Optional: override auto-fetched image by uploading your own.',
        }),
      ],
      hidden: ({ parent }: { parent: { albumSource: string } }) => parent?.albumSource !== 'embedded',
    }),
    defineField({
      name: 'customAlbum',
      title: 'Custom Album Info',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Release Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
          initialValue: 'Untitled',
        }),
        defineField({
          name: 'artist',
          title: 'Artist',
          type: 'string',
          initialValue: 'Stak',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'releaseType',
          title: 'Release Type',
          type: 'string',
          options: {
            list: [
              {title: 'Album', value: 'album'},
              {title: 'Single', value: 'single'},
              {title: 'Compilation', value: 'compilation'},
            ],
          },
          validation: (Rule) =>
            Rule.custom((releaseType, context) =>
              context?.document?.albumSource === 'custom' && !releaseType
                ? 'Release Type is required for custom albums'
                : true,
            ),
        }),
        defineField({
          name: 'customImage',
          title: 'Custom Album Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Optional: Upload a custom image for the album.',
        }),
        defineField({
          name: 'songs',
          title: 'Songs',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'song',
              title: 'Song',
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
                  options: {accept: 'audio/*'},
                  description: 'Upload the audio file for this track (if available).',
                }),
                defineField({
                  name: 'duration',
                  title: 'Duration',
                  type: 'number',
                  description: 'Track duration in seconds.',
                }),
              ],
            },
          ],
          description: 'Add individual tracks for this release. You can reorder them by dragging.',
        }),
      ],
      hidden: ({ parent }: { parent: { albumSource: string } }) => parent?.albumSource !== 'custom',
    }),
  ],
  preview: {
    select: {
      albumSource: 'albumSource',
      embeddedTitle: 'embeddedAlbum.title',
      embeddedArtist: 'embeddedAlbum.artist',
      embeddedImageUrl: 'embeddedAlbum.imageUrl',
      customTitle: 'customAlbum.title',
      customArtist: 'customAlbum.artist',
      customImage: 'customAlbum.customImage',
    },
    prepare(selection) {
      const {
        albumSource,
        embeddedTitle,
        embeddedArtist,
        embeddedImageUrl,
        customTitle,
        customArtist,
        customImage,
      } = selection

      const isEmbedded = albumSource === 'embedded'
      const imageUrl = isEmbedded
        ? embeddedImageUrl || 'https://example.com/placeholder.png'
        : customImage
          ? urlFor(customImage).width(200).url()
          : 'https://example.com/placeholder.png'

      return {
        title: isEmbedded ? embeddedTitle || 'Untitled Release' : customTitle || 'Untitled Release',
        subtitle: isEmbedded
          ? embeddedArtist || 'Unknown Artist'
          : customArtist || 'Unknown Artist',
        media: (
          <img
            src={imageUrl}
            alt="Album Cover"
            style={{width: '100%', height: 'auto', borderRadius: '4px'}}
          />
        ),
      }
    },
  },
})
