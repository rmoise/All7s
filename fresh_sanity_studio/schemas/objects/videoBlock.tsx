// schemas/videoBlock.ts
import { defineType, defineField } from 'sanity';
import getYouTubeId from 'get-youtube-id';

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
  fields: [
    defineField({
      name: 'lookTitle',
      title: 'Look Section Title',
      type: 'string',
      description: 'Title for the Look section',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'heroVideoLink',
      title: 'Hero Video Link',
      type: 'url',
      description: 'URL of the hero video (e.g., YouTube)',
      validation: Rule => Rule.uri({scheme: ['http', 'https']}).required(),
      components: {
        field: (props) => (
          <div>
            {props.renderDefault(props)}
            {props.value && <PreviewComponent url={props.value} />}
          </div>
        )
      }
    }),
    defineField({
      name: 'additionalVideos',
      title: 'Additional Video Links',
      type: 'array',
      of: [{type: 'additionalVideo'}],
      description: 'List of additional video links',
      validation: Rule => Rule.required().min(1).error('At least one video link is required'),
    }),
  ],
  preview: {
    select: {
      title: 'lookTitle',
      url: 'heroVideoLink',
    },
    prepare(selection) {
      const {title, url} = selection
      const id = getYouTubeId(url || '')
      const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : undefined

      return {
        title: title || 'Video Block',
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
