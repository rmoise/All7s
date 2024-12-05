import {defineType, defineField} from 'sanity'

interface PreviewSelection {
  title?: string
  media?: any
}

interface SettingsSchema {
  name: string
  title: string
  type: 'document'
  __experimental_actions: Array<'update' | 'publish'>
  fields: any[]
  preview: {
    select: {
      title: string
      media: string
    }
    prepare(selection: PreviewSelection): {title: string; media?: any}
  }
  hooks?: {
    onPublish?: (props: any) => Promise<any>
    onCreate?: (props: any) => Promise<any>
    onDelete?: (props: any) => Promise<any>
  }
}

const settings = defineType({
  name: 'settings',
  title: 'Site Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  groups: [
    {
      name: 'general',
      title: 'General',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
    {
      name: 'navigation',
      title: 'Navigation',
    },
    {
      name: 'footer',
      title: 'Footer',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title of your website.',
      group: 'general',
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a favicon for your website.',
      options: {
        hotspot: true,
      },
      group: 'general',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
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
      group: 'navigation',
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
          of: [
            {
              type: 'object',
              fields: [
                defineField({name: 'name', type: 'string', title: 'Name'}),
                defineField({name: 'href', type: 'string', title: 'Link'}),
              ],
            },
          ],
        }),
        defineField({
          name: 'backgroundColor',
          title: 'Background Color',
          type: 'color',
          options: {
            disableAlpha: true,
          },
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
      group: 'footer',
      fields: [
        defineField({
          name: 'copyrightText',
          title: 'Copyright Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
          initialValue: '© 2024 All Rights Reserved',
        }),
        defineField({
          name: 'fontColor',
          title: 'Font Color',
          type: 'color',
          options: {
            disableAlpha: true,
          },
        }),
        defineField({
          name: 'alignment',
          title: 'Text Alignment',
          type: 'string',
          validation: (Rule) => Rule.required(),
          options: {
            list: [
              {title: 'Left', value: 'left'},
              {title: 'Center', value: 'center'},
              {title: 'Right', value: 'right'},
            ],
            layout: 'radio',
          },
          initialValue: 'center',
        }),
        defineField({
          name: 'connectSection',
          title: 'Connect Section',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              initialValue: 'Connect with All7Z',
            }),
            defineField({
              name: 'buttons',
              title: 'Buttons',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      type: 'string',
                      title: 'Button Label',
                    }),
                    defineField({
                      name: 'url',
                      type: 'string',
                      title: 'Button URL',
                    }),
                    defineField({
                      name: 'style',
                      type: 'string',
                      title: 'Button Style',
                      options: {
                        list: [
                          {title: 'Primary', value: 'primary'},
                          {title: 'Secondary', value: 'secondary'},
                        ],
                      },
                    }),
                  ],
                },
              ],
              initialValue: [
                {
                  label: 'Instagram',
                  url: 'https://instagram.com/all7zbrand',
                  style: 'secondary',
                },
                {
                  label: 'Shop Now',
                  url: '/shop',
                  style: 'primary',
                },
              ],
            }),
          ],
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
      }
    },
  },
  hooks: {
    async onPublish(props) {
      const validationIssues = []

      if (!props.document.footer) {
        validationIssues.push('Footer object is missing')
      } else {
        if (!props.document.footer.copyrightText) {
          validationIssues.push('Copyright text is missing')
        }
        if (!props.document.footer.alignment) {
          validationIssues.push('Alignment is missing')
        }
        if (!props.document.footer.footerLinks) {
          validationIssues.push('Footer links array is missing')
        }
        if (!props.document.footer.socialLinks) {
          validationIssues.push('Social links array is missing')
        }
      }

      // If there are validation issues, you might want to handle them differently
      // For now, we'll just continue with the publish
      return props
    },

    async onCreate(props) {
      console.group('📝 Settings Document Created')
      console.log('Document:', props.document)
      console.groupEnd()
      return props
    },

    async onDelete(props) {
      console.group('🗑️ Settings Document Deleted')
      console.log('Document ID:', props.document._id)
      console.groupEnd()
      return props
    },
  },
} as SettingsSchema)

export default settings
