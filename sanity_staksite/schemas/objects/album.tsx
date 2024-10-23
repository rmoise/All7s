import {defineType, defineField, defineArrayMember} from 'sanity'
import ReleaseInfoInput from '../../components/ReleaseInfoInput'

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
      fields: [
        defineField({
          name: 'embedUrl',
          title: 'Embed URL',
          type: 'string',
          description: 'Enter Spotify or SoundCloud iframe embed URL',
          validation: (Rule) =>
            Rule.required().custom((url) => {
              if (!url) {
                return 'URL is required'
              }

              console.log('Validating URL:', url)

              const iframeMatch = url.match(/src="([^"]+)"/) // Check if it's an iframe tag
              const sanitizedUrl = iframeMatch ? iframeMatch[1] : url // Extract src URL if iframe

              console.log('Sanitized URL:', sanitizedUrl)

              // Updated pattern to match both regular and embed Spotify URLs
              const pattern =
                /^(https?:\/\/)?(www\.)?(open\.)?spotify\.com\/(embed\/)?(album|track|playlist)\/.+$/

              if (pattern.test(sanitizedUrl)) {
                return true // Validation success if it matches Spotify/SoundCloud
              }

              console.log('Invalid URL:', sanitizedUrl) // Log the invalid URL
              return 'Please enter a valid Spotify or SoundCloud URL' // Validation error
            }),
        }),
        defineField({
          name: 'title',
          title: 'Release Title',
          type: 'string',
          readOnly: true,
          hidden: false, // Hide the field
        }),
        defineField({
          name: 'artist',
          title: 'Artist',
          type: 'string',
          readOnly: true,
          hidden: false, // Hide the field
        }),
        defineField({
          name: 'platform',
          title: 'Platform',
          type: 'string',
          readOnly: true,
          hidden: false, // Hide the field
        }),
        defineField({
          name: 'releaseType',
          title: 'Release Type',
          type: 'string',
          readOnly: true,
          hidden: false, // Hide the field
        }),
        defineField({
          name: 'customImage',
          title: 'Custom Album Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          description:
            'Optional: This image is fetched from Spotify or SoundCloud automatically, but you can override it by uploading your own.',
        }),
      ],
      components: {
        input: ReleaseInfoInput,
      },
      hidden: ({parent}) => parent?.albumSource !== 'embedded',
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
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'customImage',
          title: 'Custom Album Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          description: 'Optional: Upload a custom image for the album.',
        }),
        defineField({
          name: 'songs',
          title: 'Songs',
          type: 'array',
          of: [
            defineArrayMember({
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
                  },
                  description: 'Upload the audio file for this track (if available).',
                }),
              ],
            }),
          ],
          description: 'Add individual tracks for this release. You can reorder them by dragging.',
        }),
      ],
      hidden: ({parent}) => parent?.albumSource !== 'custom',
    }),
  ],
  preview: {
    select: {
      albumSource: 'albumSource',
      embeddedTitle: 'embeddedAlbum.title',
      embeddedArtist: 'embeddedAlbum.artist',
      embeddedImage: 'embeddedAlbum.customImage',
      customTitle: 'customAlbum.title',
      customArtist: 'customAlbum.artist',
      customImage: 'customAlbum.customImage',
    },
    prepare(selection) {
      const {
        albumSource,
        embeddedTitle,
        embeddedArtist,
        embeddedImage,
        customTitle,
        customArtist,
        customImage,
      } = selection

      const isEmbedded = albumSource === 'embedded'

      return {
        title: isEmbedded ? embeddedTitle || 'Untitled Release' : customTitle || 'Untitled Release',
        subtitle: isEmbedded
          ? embeddedArtist || 'Unknown Artist'
          : customArtist || 'Unknown Artist',
        media: isEmbedded ? embeddedImage : customImage,
      }
    },
  },
})
