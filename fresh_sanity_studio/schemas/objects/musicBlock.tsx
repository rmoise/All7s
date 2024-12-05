// schemas/musicBlock.tsx
import { defineType, defineField, defineArrayMember } from 'sanity';
import { MdMusicNote } from 'react-icons/md';
import React from 'react';
import { urlFor } from '../../utils/imageUrlBuilder';

export default defineType({
  name: 'musicBlock',
  title: 'Music Block',
  type: 'object',
  icon: MdMusicNote,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      hidden: true,
      initialValue: 'LISTEN'
    }),
    defineField({
      name: 'listenTitle',
      title: 'Listen Title',
      type: 'string',
      validation: Rule => Rule.required(),
      initialValue: 'LISTEN'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'albums',
      title: 'Albums',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'album' }],
      }],
    }),
  ],
  preview: {
    select: {
      albums: 'albums',
      title: 'listenTitle',
      firstAlbumRef: 'albums.0',
      firstAlbumCustomImage: 'albums.0.customAlbum.image',
      firstAlbumEmbeddedImage: 'albums.0.embeddedAlbum.imageUrl',
    },
    prepare(selection) {
      const {albums, title, firstAlbumRef, firstAlbumCustomImage, firstAlbumEmbeddedImage} = selection;

      const albumCount = albums ? Object.keys(albums).length : 0;

      let imageUrl = null;
      if (firstAlbumCustomImage) {
        imageUrl = urlFor(firstAlbumCustomImage);
      } else if (firstAlbumEmbeddedImage) {
        imageUrl = firstAlbumEmbeddedImage;
      }

      return {
        title: title || 'Music Block',
        subtitle: `${albumCount} album${albumCount === 1 ? '' : 's'}`,
        media: imageUrl ? (
          <div style={{
            width: '30px',
            height: '30px',
            overflow: 'hidden',
            borderRadius: '4px',
            position: 'relative'
          }}>
            <img
              src={imageUrl}
              alt="Album cover"
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
        ) : <MdMusicNote style={{fontSize: 30}} />,
      };
    },
  },
});