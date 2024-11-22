// schemas/videoBlock.ts
import { defineType, defineField, defineArrayMember } from 'sanity';
import getYouTubeId from 'get-youtube-id';
import { MdPlayCircleOutline } from 'react-icons/md';
import React from 'react';

const PreviewComponent = ({url}: {url: string}) => {
  const id = getYouTubeId(url)
  const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : undefined

  if (!id || !thumbnailUrl) return null

  return (
    <div style={{ marginTop: '10px' }}>
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        style={{
          width: '200px',
          height: 'auto',
          borderRadius: '4px'
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
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heroVideoLink',
      title: 'Hero Video Link',
      type: 'url',
      description: 'The main/hero YouTube video URL',
      validation: Rule => Rule.required(),
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
              validation: Rule => Rule.required()
            })
          ]
        })
      ],
      description: 'Additional YouTube video links',
    }),
  ],
  preview: {
    select: {
      heroVideo: 'heroVideoLink',
      additionalVideos: 'additionalVideos',
    },
    prepare(selection: Record<string, any>) {
      const {heroVideo, additionalVideos} = selection
      const videoCount = (additionalVideos?.length || 0) + (heroVideo ? 1 : 0)
      return {
        title: 'Video Block',
        subtitle: `${videoCount} video${videoCount === 1 ? '' : 's'}`,
        media: React.createElement(MdPlayCircleOutline)
      }
    },
  },
});
