// schemas/additionalVideo.tsx
import { defineType, defineField } from 'sanity';
import getYouTubeId from 'get-youtube-id';
import { MdPlayCircleOutline } from 'react-icons/md';
import React from 'react';

const PreviewComponent = ({ url }: { url: string }) => {
  const id = getYouTubeId(url);
  const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : undefined;

  if (!id || !thumbnailUrl) return null;

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
  );
};

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
      title: 'YouTube URL',
      type: 'url',
      validation: Rule => Rule.required(),
      components: {
        input: PreviewComponent as any,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
    },
    prepare(selection: Record<string, any>) {
      const { title, url } = selection;
      return {
        title: title || 'Video',
        subtitle: url,
        media: <MdPlayCircleOutline />,
      };
    },
  },
});
