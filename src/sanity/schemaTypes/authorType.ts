import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';

const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
    }),
    // ... other fields
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image'
    },
    prepare(selection) {
      const {title, media} = selection;
      return {
        title: title || 'Untitled Author',
        media: media
      };
    }
  }
});

export default author;
