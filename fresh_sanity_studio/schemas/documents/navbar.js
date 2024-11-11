import { defineType } from 'sanity';

export default defineType({
  name: 'navbar',
  title: 'Navbar',
  type: 'document',
  fields: [
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'navigationLinks',
      type: 'array',
      title: 'Navigation Links',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              type: 'string',
              title: 'Link Name'
            },
            {
              name: 'href',
              type: 'string',
              title: 'URL',
              description: 'Enter a relative URL or anchor link like /#LOOK'
            }
          ]
        }
      ]
    },
    {
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'color',
    },
    {
      name: 'isTransparent',
      title: 'Transparent Background',
      type: 'boolean',
      description: 'Check this box to make the Navbar background transparent.',
    },
  ],
  preview: {
    select: {
      title: 'logo',
      navigationLinks: 'navigationLinks',
    },
    prepare(selection) {
      const { title, navigationLinks } = selection;
      return {
        title: title ? 'Navbar' : 'Navbar (No Logo)',
        subtitle: `${navigationLinks ? navigationLinks.length : 0} Links`,
      };
    },
  },
});
