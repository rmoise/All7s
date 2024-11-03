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
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{ type: 'additionalVideo' }],
      description: 'List of additional video links',
      validation: Rule =>
        Rule.required().custom((videos) => {
          if (!videos?.length) return 'At least one video link is required'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      videosRaw: 'videos',
    },
    prepare(selection: Record<string, any>) {
      const {title, videosRaw} = selection
      return {
        title: title || 'Video Block',
        subtitle: `${videosRaw?.length || 0} videos`,
        media: <MdPlayCircleOutline />,
      }
    },
  },
});
