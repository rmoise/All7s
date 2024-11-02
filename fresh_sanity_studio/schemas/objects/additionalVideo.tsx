// schemas/additionalVideo.tsx
import { defineType, defineField } from 'sanity';
import getYouTubeId from 'get-youtube-id';

export default defineType({
  name: 'additionalVideo',
  title: 'Additional Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: Rule => Rule.uri({ scheme: ['http', 'https'] }).required(),
    }),
    defineField({
      name: 'title',
      title: 'Video Title',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare(selection) {
      const {title, url} = selection
      const id = getYouTubeId(url)
      const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null

      return {
        title: title || 'Additional Video',
        subtitle: url,
        media: thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
        ) : null
      }
    }
  },
});
