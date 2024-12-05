// schemas/videoBlock.ts
import {defineType, defineField, defineArrayMember, set} from 'sanity'
import getYouTubeId from 'get-youtube-id'
import {MdPlayCircleOutline} from 'react-icons/md'
import React from 'react'
import {TextInput} from '@sanity/ui'

const PreviewComponent = ({value}: {value: {url: string}}) => {
  const id = getYouTubeId(value.url)
  const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : undefined

  if (!id || !thumbnailUrl) return null

  return (
    <div style={{
      width: '30px',
      height: '30px',
      overflow: 'hidden',
      borderRadius: '4px',
      position: 'relative'
    }}>
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  )
}

export default defineType({
  name: 'videoBlock',
  title: 'Video Block',
  type: 'object',
  icon: MdPlayCircleOutline,
  fields: [
    defineField({
      name: 'lookTitle',
      title: 'Look Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroVideoLink',
      title: 'Hero Video Link',
      type: 'url',
      description: 'The main/hero YouTube video URL',
      validation: (Rule) => Rule.required(),
      components: {
        input: ({value, onChange}) => (
          <div style={{display: 'flex', alignItems: 'center'}}>
            <TextInput
              value={value || ''}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onChange(set(event.currentTarget.value))
              }
              type="url"
              style={{flex: 1}}
            />
            {value && <PreviewComponent value={{url: value}} />}
          </div>
        ),
      },
    }),
    defineField({
      name: 'additionalVideos',
      title: 'Additional Videos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'video',
          fields: [
            defineField({
              name: 'url',
              type: 'url',
              title: 'YouTube URL',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              url: 'url',
            },
            prepare({url}) {
              return {
                title: url,
                media: url ? <PreviewComponent value={{url}} /> : <MdPlayCircleOutline />,
              }
            },
          },
        }),
      ],
      description: 'Additional YouTube video links',
    }),
  ],
  preview: {
    select: {
      heroVideo: 'heroVideoLink',
      additionalVideos: 'additionalVideos',
      title: 'lookTitle',
    },
    prepare({heroVideo, additionalVideos, title}) {
      const videoCount = (additionalVideos?.length || 0) + (heroVideo ? 1 : 0)
      return {
        title: title || 'Video Block',
        subtitle: `${videoCount} video${videoCount === 1 ? '' : 's'}`,
        media: heroVideo ? <PreviewComponent value={{url: heroVideo}} /> : <MdPlayCircleOutline />,
      }
    },
  },
})
