// schemas/album.tsx

import React from 'react'
import {Box} from '@sanity/ui'
import {defineField, defineType} from 'sanity'
import ReleaseInfoInput from '../../components/ReleaseInfoInput'
import {urlFor} from '../../utils/imageUrlBuilder'
import type {SanityImage} from '../../../types/sanity'
import {StringRule, TextRule, UrlRule, ValidationContext, ImageRule} from '@sanity/types'

type ValidationRule = StringRule | TextRule | UrlRule

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
          hidden: true,
        }),
        defineField({
          name: 'title',
          title: 'Release Title',
          type: 'string',
          readOnly: true,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'artist',
          title: 'Artist',
          type: 'string',
          readOnly: true,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'platform',
          title: 'Platform',
          type: 'string',
          readOnly: true,
        }),
        defineField({
          name: 'releaseType',
          title: 'Release Type',
          type: 'string',
          readOnly: true,
        }),
        defineField({
          name: 'imageUrl',
          title: 'Album Image URL',
          type: 'url',
          readOnly: true,
        }),
        defineField({
          name: 'embedUrl',
          title: 'Embed URL',
          type: 'url',
          readOnly: true,
        }),
        defineField({
          name: 'isEmbedSupported',
          title: 'Embed Supported',
          type: 'boolean',
          readOnly: true,
        }),
        defineField({
          name: 'customImage',
          title: 'Custom Album Image',
          type: 'image',
          options: {hotspot: true},
        }),
      ],
      components: {
        input: ReleaseInfoInput,
      },
      hidden: ({parent}: {parent: Record<string, unknown>}) => parent?.albumSource !== 'embedded',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context?.document?.albumSource !== 'embedded') return true
          return value?.embedCode ? true : 'Please enter an embed code'
        }),
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
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'artist',
          title: 'Artist',
          type: 'string',
          validation: (rule) => rule.required(),
          initialValue: 'Stak',
          readOnly: true,
        }),
        defineField({
          name: 'image',
          title: 'Album Image',
          type: 'image',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'songs',
          title: 'Songs',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              defineField({
                name: 'trackTitle',
                title: 'Track Title',
                type: 'string',
                validation: (rule) => rule.required(),
              }),
              defineField({
                name: 'duration',
                title: 'Duration (seconds)',
                type: 'number',
              }),
              defineField({
                name: 'file',
                title: 'Audio File',
                type: 'file',
                validation: (rule) => rule.required(),
              }),
            ],
          }],
        }),
      ],
      hidden: ({parent}: {parent: Record<string, unknown>}) => parent?.albumSource !== 'custom',
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
      customImage: 'customAlbum.image',
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
          <div
            style={{
              backgroundColor: '#f3f3f3',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={imageUrl}
              alt="Album Cover"
              style={{
                display: 'block',
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                borderRadius: '4px',
                backgroundColor: '#f3f3f3',
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
              padding: '10px',
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
