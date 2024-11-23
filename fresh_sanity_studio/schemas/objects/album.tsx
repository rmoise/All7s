// schemas/album.tsx

import React from 'react'
import {Box} from '@sanity/ui'
import {defineField, defineType} from 'sanity'
import {Rule} from '@sanity/types'
import ReleaseInfoInput from '../../components/ReleaseInfoInput'
import {urlFor} from '../../utils/imageUrlBuilder'
import type {SanityImage} from '../../../types/sanity'

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
  customImage?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
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
      validation: Rule => Rule.required(),
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
          validation: Rule =>
            Rule.custom((value, context) => {
              if (!value || typeof value !== 'string' || !value.trim()) {
                return 'Embed code is required'
              }
              return true
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
          validation: Rule => Rule.required(),
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
          validation: Rule => Rule.required(),
          initialValue: 'Untitled',
        }),
        defineField({
          name: 'artist',
          title: 'Artist',
          type: 'string',
          initialValue: 'Stak',
          validation: Rule => Rule.required(),
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
          validation: Rule => Rule.required(),
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
      let imageUrl: string = ''

      if (isEmbedded && embeddedImageUrl) {
        imageUrl = embeddedImageUrl
      } else if (customImage) {
        imageUrl = urlFor(customImage) as string
      }

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
