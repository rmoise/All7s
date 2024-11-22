import { defineType, defineField } from 'sanity';
import { colorInput } from '@sanity/color-input';

export default defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    {
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      description: 'Text for the copyright section in the footer',
    },
    {
      name: 'footerLinks',
      title: 'Footer Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Link Text',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Social Media Platform',
              type: 'string',
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
            },
            {
              name: 'iconUrl',
              title: 'Icon URL',
              type: 'url',
            },
          ],
        },
      ],
    },
    {
      name: 'fontColor',
      title: 'Font Color',
      type: 'color',
      options: {
        disableAlpha: true,
      },
    },
    {
      name: 'alignment',
      title: 'Text Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
    },
  ],
  preview: {
    select: {
      title: 'copyrightText',
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title || 'Footer Section',
        subtitle: 'Footer settings and links',
        media: null, // Optionally, you could add an icon here
      };
    },
  },
});
