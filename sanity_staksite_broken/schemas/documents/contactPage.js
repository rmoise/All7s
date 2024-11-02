import { defineType } from 'sanity';

export default defineType({
  name: 'contactPage',
  type: 'document',
  title: 'Contact Page',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Page Title',
      validation: Rule => Rule.required().min(5).max(50),
    },
    {
      name: 'description',
      type: 'text',
      title: 'Page Description',
      description: 'A short description for the contact page.',
    },
    {
      name: 'address',
      type: 'string',
      title: 'Address',
      description: 'The physical address for your contact location.',
    },
    {
      name: 'phoneNumber',
      type: 'string',
      title: 'Phone Number',
      description: 'The contact phone number.',
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email',
      description: 'Contact email address.',
    },
    {
      name: 'contactFormMessage',
      type: 'text',
      title: 'Contact Form Message',
      description: 'A message that will appear above the contact form.',
    },
    {
      name: 'socialLinks',
      type: 'array',
      title: 'Social Media Links',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              type: 'string',
              title: 'Platform',
              validation: Rule => Rule.required(),
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL',
              validation: Rule => Rule.required().uri({
                scheme: ['http', 'https'],
              }),
            },
          ],
        },
      ],
    },
    {
      name: 'map',
      type: 'string',
      title: 'Embed Map URL',
      description: 'Google Maps or other map embedding iframe URL.',
    },
    {
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'The meta title for the contact page.',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'The meta description for the contact page.',
        },
        {
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Image for social sharing.',
          options: {
            hotspot: true,
          },
        },
      ],
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Contact Page', // Static title preview
      };
    },
  },
});
