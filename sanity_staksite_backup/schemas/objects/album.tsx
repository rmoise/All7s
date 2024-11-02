// schemas/album.tsx

import React from 'react'
import {Box} from '@sanity/ui'
import {defineArrayMember, defineField, defineType} from 'sanity'
import ReleaseInfoInput from '../../components/ReleaseInfoInput'
import {urlFor} from '../../utils/imageUrlBuilder'

interface ValidationRule {
  required: () => ValidationRule
  custom: (fn: (value: any, context: ValidationContext) => true | string) => ValidationRule
  uri: (options: {scheme: string[]}) => ValidationRule
  warning: (message: string) => ValidationRule
}

interface ValidationContext {
  document?: {
    albumSource?: string
    [key: string]: any
  }
  parent?: any
  path?: string[]
}

interface AlbumSelection {
  albumSource: string
  embeddedTitle?: string
  embeddedArtist?: string
  embeddedImageUrl?: string
  customTitle?: string
  customArtist?: string
  customImage?: any
}

interface ParentType {
  albumSource?: string
}

const albumSchema = defineType({
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
      validation: (rule: ValidationRule) => rule.required(),
      initialValue: 'embedded',
    }),
    defineField({
      name: 'embeddedAlbum',
      title: 'Embedded Album Info',
      type: 'object',
      fields: [
        defineField({
          name: 'embedCode',
          title: 'Embed Code',
          type: 'text',
          description: 'Enter Spotify or SoundCloud URL or iframe embed code',
          readOnly: false,
          validation: (rule: ValidationRule) =>
            rule.custom((embedCode: string, context: ValidationContext) => {
              if (!embedCode || !embedCode.trim()) return 'Embed code is required'

              const embedString = embedCode.trim()
              const lowerCaseEmbedCode = embedString.toLowerCase()

              if (
                lowerCaseEmbedCode.includes('<iframe') &&
                (lowerCaseEmbedCode.includes('soundcloud.com') ||
                  lowerCaseEmbedCode.includes('spotify.com'))
              ) {
                return true
              }

              const isValidUrl =
                embedString.startsWith('http://') || embedString.startsWith('https://')
              const isSpotifyUrl = lowerCaseEmbedCode.includes('spotify.com')
              const isSoundCloudUrl =
                lowerCaseEmbedCode.includes('soundcloud.com') ||
                lowerCaseEmbedCode.includes('api.soundcloud.com')

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
          validation: (rule: ValidationRule) =>
            rule.uri({scheme: ['http', 'https']}).warning('Ensure image URL is an external link.'),
        }),
        defineField({
          name: 'customImage',
          title: 'Custom Album Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Optional: override auto-fetched image by uploading your own.',
        }),
      ],
      components: {input: ReleaseInfoInput},
      hidden: ({parent}: {parent: ParentType}) => parent?.albumSource !== 'embedded',
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
          validation: (rule: ValidationRule) => rule.required(),
          initialValue: 'Untitled',
        }),
        defineField({
          name: 'artist',
          title: 'Artist',
          type: 'string',
          initialValue: 'Stak',
          validation: (rule: ValidationRule) => rule.required(),
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
          validation: (rule: ValidationRule) =>
            rule.custom((releaseType: string, context: ValidationContext) =>
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
      hidden: ({parent}: {parent: ParentType}) => parent?.albumSource !== 'custom',
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
    prepare(selection: AlbumSelection) {
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
          <Box as="img"
            src={imageUrl}
            alt="Album Cover"
            style={{width: '100%', height: 'auto', borderRadius: '4px'}}
          />
        ),
      }
    },
  },
})

export default albumSchema
