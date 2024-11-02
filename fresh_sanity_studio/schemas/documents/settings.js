import { defineType } from 'sanity';

export default defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: [/*'create',*/ 'update', /*'delete',*/ 'publish'],
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title of your website.',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a favicon for your website.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Default meta title for pages if not specifically defined.',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Default meta description for pages if not specifically defined.',
        },
        {
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Default image for social sharing.',
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: 'navbar',
      title: 'Navbar',
      type: 'object',
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
          title: 'Navigation Links',
          type: 'array',
          of: [{ type: 'object', fields: [
            { name: 'name', type: 'string', title: 'Name' },
            { name: 'href', type: 'string', title: 'Link' }
          ]}],
        },
        {
          name: 'backgroundColor',
          title: 'Background Color',
          type: 'color',
        },
        {
          name: 'isTransparent',
          title: 'Is Transparent',
          type: 'boolean',
        },
      ],
    },
    {
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        {
          name: 'copyrightText',
          title: 'Copyright Text',
          type: 'string',
        },
        {
          name: 'footerLinks',
          title: 'Footer Links',
          type: 'array',
          of: [{ type: 'object', fields: [
            { name: 'text', type: 'string', title: 'Link Text' },
            { name: 'url', type: 'url', title: 'URL' }
          ]}],
        },
        {
          name: 'socialLinks',
          title: 'Social Media Links',
          type: 'array',
          of: [{ type: 'object', fields: [
            { name: 'platform', type: 'string', title: 'Social Media Platform' },
            { name: 'url', type: 'url', title: 'URL' },
            { name: 'iconUrl', type: 'url', title: 'Icon URL' }
          ]}],
        },
        {
          name: 'fontColor',
          title: 'Footer Text Color',
          type: 'color',
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
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'favicon',
    },
    prepare({ title, media }) {
      return {
        title: title || 'Site Settings',
        media,
      };
    },
  },
});
