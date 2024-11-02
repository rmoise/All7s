// schemas/additionalVideo.tsx
import { defineType, defineField } from 'sanity';
import getYouTubeId from 'get-youtube-id';
import { MdPlayCircleOutline } from 'react-icons/md';

export default defineType({
  name: 'additionalVideo',
  title: 'Additional Video',
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
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare(selection: { title: string; url: string }) {
      const { title, url } = selection
      const id = getYouTubeId(url)

      return {
        title: title || 'Untitled Video',
        subtitle: url,
        media: id ? (
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt={title}
          />
        ) : undefined
      }
    },
  },
});
