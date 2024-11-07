// schemas/album.tsx

import React from 'react'
import {Box} from '@sanity/ui'
import {defineField, defineType} from 'sanity'
import ReleaseInfoInput from '../../components/ReleaseInfoInput'
import {urlFor} from '../../utils/imageUrlBuilder'
import type {SanityImage} from '../../../types/sanity'

interface ValidationRule {
  required: () => ValidationRule
  custom: (fn: (value: unknown, context: ValidationContext) => true | string) => ValidationRule
  uri: (options: {scheme: string[]}) => ValidationRule
  warning: (message: string) => ValidationRule
}

interface ValidationContext {
  document?: {
    albumSource?: string
    [key: string]: unknown
  }
  parent?: Record<string, unknown>
  path?: string[]
}

interface ParentType {
  albumSource?: string
}

interface AlbumSelection {
  albumSource: string
  embeddedTitle?: string
  embeddedArtist?: string
  embeddedImageUrl?: string
  customTitle?: string
  customArtist?: string
  customImage?: SanityImage
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
            rule.custom((value: unknown) => {
              if (!value || typeof value !== 'string' || !value.trim()) {
                return 'Embed code is required'
              }

              const embedString = value.trim()
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
        defineField({
          name: 'processedImageUrl',
          type: 'string',
          title: 'Processed Image URL',
          readOnly: true,
          description: 'Automatically processed high-resolution image URL'
        })
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
            rule.custom((value: unknown, context: ValidationContext) => {
              if (context?.document?.albumSource === 'custom' && !value) {
                return 'Release Type is required for custom albums'
              }
              return true
            }),
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
                  options: {
                    accept: 'audio/*',
                    storeOriginalFilename: true,
                  },
                  validation: (Rule) =>
                    Rule.custom((value) => {
                      if (!value && !value?.asset) {
                        return 'Audio file is required';
                      }
                      return true;
                    }),
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

      let imageUrl: string = ''

      console.log('Embedded Image URL:', embeddedImageUrl)
      console.log('Custom Image:', customImage)

      if (isEmbedded && embeddedImageUrl) {
        imageUrl = embeddedImageUrl
      } else if (customImage) {
        imageUrl = urlFor(customImage) as string
      }

      console.log('Final Image URL:', imageUrl)

      return {
        title: isEmbedded ? embeddedTitle || 'Untitled Release' : customTitle || 'Untitled Release',
        subtitle: isEmbedded
          ? embeddedArtist || 'Unknown Artist'
          : customArtist || 'Unknown Artist',
        media: imageUrl ? (
          <div style={{
            backgroundColor: '#f3f3f3',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={imageUrl}
              alt="Album Cover"
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                borderRadius: '4px',
                backgroundColor: '#f3f3f3'
              }}
              onError={(e) => {
                console.error('Image failed to load:', imageUrl)
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#f3f3f3',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px'
            }}
          >
            No Image
          </div>
        ),
      }
    },
  },
})

export default albumSchema
