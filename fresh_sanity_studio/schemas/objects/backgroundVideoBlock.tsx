// schemas/backgroundVideoBlock.js

import {defineType, defineField} from 'sanity'
import {MdOndemandVideo} from 'react-icons/md'
import getYouTubeId from 'get-youtube-id'
import React from 'react'
import {StringInputProps, StringSchemaType, set} from 'sanity'
import {Stack, TextInput} from '@sanity/ui'

// Separate component for input preview
const YouTubeInput = React.forwardRef<HTMLInputElement, StringInputProps<StringSchemaType>>(
  (props, ref) => {
    const id = props.value ? getYouTubeId(props.value) : null
    const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : undefined

    return (
      <Stack space={3}>
        <TextInput
          ref={ref}
          value={props.value || ''}
          onChange={(event) => {
            const patch = set(event.currentTarget.value)
            props.onChange(patch)
          }}
          type="url"
        />
        {thumbnailUrl && (
          <div>
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              style={{
                width: '200px',
                height: 'auto',
                borderRadius: '4px',
              }}
            />
          </div>
        )}
      </Stack>
    )
  },
)

// Preview component for the document list
const PreviewComponent = () => {
  return (
    <div style={{
      width: '30px',
      height: '30px',
      background: '#f4f4f4',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <MdOndemandVideo style={{fontSize: 20, color: '#666'}} />
    </div>
  );
};

interface BackgroundVideoParent {
  backgroundVideoFile?: {
    _type: string
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  backgroundVideoUrl?: string
}

export default defineType({
  name: 'backgroundVideoBlock',
  title: 'Background Video Block',
  type: 'object',
  fields: [
    defineField({
      name: 'backgroundVideoUrl',
      title: 'Background Video URL',
      type: 'url',
      description: 'URL for the background video (e.g., YouTube)',
      hidden: ({parent}: {parent: BackgroundVideoParent}) => Boolean(parent?.backgroundVideoFile),
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
      components: {
        input: YouTubeInput,
      },
    }),
    defineField({
      name: 'backgroundVideoFile',
      title: 'Background Video File',
      type: 'file',
      options: {
        accept: 'video/*',
      },
      description: 'Upload a video file for the background',
      hidden: ({parent}: {parent: BackgroundVideoParent}) => Boolean(parent?.backgroundVideoUrl),
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster Image',
      type: 'image',
      description: 'Preview image for the video block',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      media: 'posterImage',
      videoUrl: 'backgroundVideoUrl',
      videoFile: 'backgroundVideoFile',
    },
    prepare({media, videoUrl, videoFile}) {
      return {
        title: 'Background Video Block',
        subtitle: videoUrl || (videoFile ? 'Uploaded video file' : 'No video selected'),
        media: (videoUrl || videoFile) ? <PreviewComponent /> : (media || <MdOndemandVideo style={{fontSize: 30}} />),
      };
    },
  },
})
