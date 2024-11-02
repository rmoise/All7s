// schemas/musicBlock.tsx
import { defineType, defineField } from 'sanity';
import { urlFor } from '../../utils/imageUrlBuilder'

export default defineType({
  name: 'musicBlock',
  title: 'Music Block',
  type: 'object',
  fields: [
    defineField({
      name: 'listenTitle',
      title: 'Listen Section Title',
      type: 'string',
      description: 'Title for the Listen section',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'albums',
      title: 'Albums',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'album' }],
        options: {
          disableNew: false,
          weak: true // This allows referencing unpublished documents
        }
      }],
      description: 'List of music albums to display',
      validation: Rule => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'listenTitle',
      albumSource: 'albums.0.albumSource',
      embeddedTitle: 'albums.0.embeddedAlbum.title',
      embeddedArtist: 'albums.0.embeddedAlbum.artist',
      embeddedImage: 'albums.0.embeddedAlbum.customImage',
      embeddedImageUrl: 'albums.0.embeddedAlbum.imageUrl',
      customTitle: 'albums.0.customAlbum.title',
      customArtist: 'albums.0.customAlbum.artist',
      customImage: 'albums.0.customAlbum.customImage',
    },
    prepare(selection) {
      const {
        title,
        albumSource,
        embeddedTitle,
        embeddedArtist,
        embeddedImage,
        embeddedImageUrl,
        customTitle,
        customArtist,
        customImage,
      } = selection;

      const isEmbedded = albumSource === 'embedded';

      // Determine display title and artist
      const displayTitle = isEmbedded ? embeddedTitle : customTitle;
      const displayArtist = isEmbedded ? embeddedArtist : customArtist;

      // Determine image
      const imageUrl = isEmbedded
        ? embeddedImageUrl || 'https://example.com/placeholder.png'
        : customImage
          ? urlFor(customImage).width(200).url()
          : 'https://example.com/placeholder.png';

      return {
        title: title || 'Music Block',
        subtitle: displayTitle
          ? `${displayTitle} by ${displayArtist || 'Unknown Artist'}`
          : 'No album selected',
        media: (
          <img
            src={imageUrl}
            alt="Album Cover"
            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
          />
        ),
      };
    },
  },
});