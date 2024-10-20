import { defineType } from 'sanity';

export default defineType({
  name: 'colorTheme',
  title: 'Color Theme',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Theme Name',
      type: 'string',
    },
    {
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'color',
    },
    // Add other color fields as needed
  ],
});

