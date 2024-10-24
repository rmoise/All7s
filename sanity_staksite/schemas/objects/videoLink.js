import { defineType } from 'sanity';

export default defineType({
  name: 'videoLink',
  title: 'YouTube Link',
  type: 'document',
  fields: [
    {
      name: 'url',
      title: 'URL',
      type: 'url',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'string',
    },
  ],
});
