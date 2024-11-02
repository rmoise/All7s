// schemas/musicAndVideo.js

import { defineType } from 'sanity';

export default defineType({
  name: 'musicAndVideo',
  title: 'Music and Video Section',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Title for the music and video section',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short description of this section',
    },
    {
      name: 'lookTitle',
      title: 'LOOK Section Title',
      type: 'string',
      description: 'Title for the LOOK section',
    },
    {
      name: 'listenTitle',
      title: 'LISTEN Section Title',
      type: 'string',
      description: 'Title for the LISTEN section',
    },
    {
      name: 'musicLink',
      title: 'Music Link',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'album' }] }],
      description: 'Links to music albums',
    },
    {
      name: 'heroLink',
      title: 'Hero Video Link',
      type: 'url',
      description: 'Hero video link (e.g., YouTube or Vimeo)',
    },
    {
      name: 'vidLink',
      title: 'Video Link',
      type: 'array',
      of: [{ type: 'url' }],
      description: 'Additional video links',
      validation: (Rule) => Rule.required().min(1).error('At least one video link is required'),

    },
    {
      name: 'backgroundVideo',
      title: 'Background Video',
      type: 'object',
      description: 'This field allows you to set a background video for the section. You can either upload a video file or provide an external URL. If both are provided, the uploaded video file will take priority over the URL.',
      fields: [
        {
          name: 'backgroundVideoUrl',
          title: 'Background Video URL',
          type: 'url',
          description: 'URL for the background video to be used. This will be used only if no video file is uploaded.',
          hidden: ({ parent }) => parent?.backgroundVideoFile, // Hide if a video file is uploaded
        },
        {
          name: 'backgroundVideoFile',
          title: 'Background Video File',
          type: 'file',
          options: {
            accept: 'video/*',
          },
          description: 'Upload a video file to be used as the background. If both a file and a URL are provided, the file will take priority.',
          hidden: ({ parent }) => parent?.backgroundVideoUrl, // Hide if a video URL is provided
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title || 'Music and Video Section',
      };
    },
  },
});
