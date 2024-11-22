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
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title of your website.',
      group: 'general'
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a favicon for your website.',
      options: {
        hotspot: true,
      },
      group: 'general'
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
        }),
        defineField({
          name: 'footerLinks',
          title: 'Footer Links',
          type: 'array',
          description: 'Add links to important pages',
          of: [
            {
              type: 'object',
              preview: {
                select: {
                  title: 'text',
                  subtitle: 'url',
                },
              },
              fields: [
                defineField({
                  name: 'text',
                  type: 'string',
                  title: 'Link Text',
                  description: 'The text to display for this link',
                }),
                defineField({
                  name: 'url',
                  type: 'url',
                  title: 'URL',
                  description: 'Where should this link go?',
                }),
              ],
            },
          ],
          initialValue: [],
        }),
        defineField({
          name: 'socialLinks',
          title: 'Social Media Links',
          type: 'array',
          description: 'Add your social media links',
          of: [
            {
              type: 'object',
              preview: {
                select: {
                  title: 'platform',
                  subtitle: 'url',
                },
              },
              fields: [
                defineField({
                  name: 'platform',
                  type: 'string',
                  title: 'Platform',
                  description: 'e.g., Instagram, Twitter, etc.',
                }),
                defineField({
                  name: 'url',
                  type: 'url',
                  title: 'URL',
                  description: 'Link to your social media profile',
                }),
                defineField({
                  name: 'iconUrl',
                  type: 'url',
                  title: 'Icon URL',
                  description: 'URL to the social media icon',
                }),
              ],
            },
          ],
          initialValue: [],
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
      console.group('📝 Settings Document Publishing')

      // Log the mutation details
      console.log('Mutation Details:', {
        type: props.type,
        transition: props.transition,
        previousRev: props.document._rev,
      })

      // Log footer state
      console.log('Footer State:', {
        current: props.document.footer,
        hasRequiredFields: !!(
          props.document.footer?.alignment && props.document.footer?.copyrightText
        ),
        missingFields: [
          !props.document.footer?.footerLinks && 'footerLinks',
          !props.document.footer?.socialLinks && 'socialLinks',
        ].filter(Boolean),
      })

      // Validate footer structure
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

      if (validationIssues.length > 0) {
        console.warn('⚠️ Validation Issues:', validationIssues)
      } else {
        console.log('✅ Document is valid')
      }

      console.groupEnd()
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
