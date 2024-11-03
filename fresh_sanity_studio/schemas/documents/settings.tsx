import { defineType, defineField } from 'sanity';

interface PreviewSelection {
  title?: string;
  media?: any;
}

interface SettingsSchema {
  name: string;
  title: string;
  type: 'document';
  __experimental_actions: Array<'update' | 'publish'>;
  fields: any[];
  preview: {
    select: {
      title: string;
      media: string;
    };
    prepare(selection: PreviewSelection): { title: string; media?: any };
  };
}

const settings = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title of your website.',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a favicon for your website.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Default meta title for pages if not specifically defined.',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Default meta description for pages if not specifically defined.',
        }),
        defineField({
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Default image for social sharing.',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'navbar',
      title: 'Navbar',
      type: 'object',
      fields: [
        defineField({
          name: 'logo',
          title: 'Logo',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'navigationLinks',
          title: 'Navigation Links',
          type: 'array',
          of: [{ type: 'object', fields: [
            defineField({ name: 'name', type: 'string', title: 'Name' }),
            defineField({ name: 'href', type: 'string', title: 'Link' })
          ]}],
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Background Color',
          type: 'color',
        }),
        defineField({
          name: 'isTransparent',
          title: 'Is Transparent',
          type: 'boolean',
        }),
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        defineField({
          name: 'copyrightText',
          title: 'Copyright Text',
          type: 'string',
        }),
        defineField({
          name: 'footerLinks',
          title: 'Footer Links',
          type: 'array',
          of: [{ type: 'object', fields: [
            defineField({ name: 'text', type: 'string', title: 'Link Text' }),
            defineField({ name: 'url', type: 'url', title: 'URL' })
          ]}],
        }),
        defineField({
          name: 'socialLinks',
          title: 'Social Media Links',
          type: 'array',
          of: [{ type: 'object', fields: [
            defineField({ name: 'platform', type: 'string', title: 'Social Media Platform' }),
            defineField({ name: 'url', type: 'url', title: 'URL' }),
            defineField({ name: 'iconUrl', type: 'url', title: 'Icon URL' })
          ]}],
        }),
        defineField({
          name: 'fontColor',
          title: 'Footer Text Color',
          type: 'color',
        }),
        defineField({
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
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'favicon',
    },
    prepare(selection: PreviewSelection) {
      return {
        title: selection.title || 'Site Settings',
        media: selection.media,
      };
    },
  },
} as SettingsSchema);

export default settings;
