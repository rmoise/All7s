import { defineType, defineField } from 'sanity';
import { MdEmail } from 'react-icons/md';

interface NotificationParent {
  showSocialLinks?: boolean;
  [key: string]: any;
}

export default defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      initialValue: 'GET MORE ALL7Z'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      initialValue: 'SIGN UP TO HEAR MORE FROM US'
    }),
    defineField({
      name: 'placeholderText',
      title: 'Placeholder Text',
      type: 'string',
      initialValue: 'Enter your email'
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
      initialValue: 'Subscribe'
    }),
    defineField({
      name: 'formName',
      title: 'Form Name',
      type: 'string',
      description: 'Unique identifier for the newsletter form',
      initialValue: 'newsletter'
    }),
    defineField({
      name: 'notification',
      title: 'Success Notification',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: 'Successfully subscribed!'
        }),
        defineField({
          name: 'description',
          title: 'Description',
          type: 'string',
          initialValue: 'Thanks for joining our newsletter.'
        }),
        defineField({
          name: 'showSocialLinks',
          title: 'Show Social Links',
          type: 'boolean',
          description: 'Toggle the social media links section',
          initialValue: true
        }),
        defineField({
          name: 'socialLinksTitle',
          title: 'Social Links Title',
          type: 'string',
          initialValue: 'Follow us:',
          hidden: ({ parent }: { parent: NotificationParent }) => !parent?.showSocialLinks,
        }),
        defineField({
          name: 'socialLinks',
          title: 'Social Links',
          type: 'array',
          hidden: ({ parent }: { parent: NotificationParent }) => !parent?.showSocialLinks,
          of: [{
            type: 'object',
            fields: [
              defineField({
                name: 'platform',
                title: 'Platform',
                type: 'string',
                options: {
                  list: [
                    { title: 'X', value: 'x' },
                    { title: 'Instagram', value: 'instagram' }
                  ]
                }
              }),
              defineField({
                name: 'url',
                title: 'URL',
                type: 'url'
              }),
              defineField({
                name: 'color',
                title: 'Icon Color',
                type: 'color',
                options: { disableAlpha: true }
              })
            ]
          }],
          initialValue: [
            { platform: 'x', url: 'https://x.com/all7z', color: { hex: '#FFFFFF' } },
            { platform: 'instagram', url: 'https://instagram.com/all7z', color: { hex: '#E1306C' } }
          ]
        })
      ]
    })
  ],
  preview: {
    select: {
      headline: 'headline',
      description: 'description'
    },
    prepare({ headline, description }) {
      return {
        title: 'Newsletter Block',
        subtitle: headline || 'Newsletter signup section',
        media: <MdEmail style={{ fontSize: 30 }} />
      }
    }
  }
});
