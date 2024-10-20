import { defineType } from 'sanity';

export default defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    // Add other fields as needed
  ],
});

