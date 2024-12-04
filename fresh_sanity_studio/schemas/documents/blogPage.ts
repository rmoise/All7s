import {defineType, defineField} from 'sanity'
import {ComponentIcon} from '@sanity/icons'

interface SanityDocument {
  featuredPost?: {
    _ref: string
  }
}

export default defineType({
  name: 'blogPage',
  title: 'Blog Page',
  type: 'document',
  icon: ComponentIcon,
  groups: [
    {
      name: 'hero',
      title: 'Hero Section',
    },
    {
      name: 'content',
      title: 'Content',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'hero',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      description: 'A brief description below the title',
      group: 'hero',
    }),
    defineField({
      name: 'featuredPost',
      title: 'Featured Post',
      description: 'Select one post to feature at the top of the blog',
      type: 'reference',
      to: [{type: 'post'}],
      group: 'content',
    }),
    defineField({
      name: 'blogFeed',
      title: 'Blog Feed',
      description: 'Posts that appear in the main blog feed under "More Stories"',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{type: 'post'}],
        options: {
          filter: ({document}: {document: SanityDocument}) => {
            const featuredPostId = document?.featuredPost?._ref
            return {
              filter: '!(_id in $ids)',
              params: {
                ids: featuredPostId ? [featuredPostId] : []
              }
            }
          }
        }
      }],
      group: 'content',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          validation: (Rule) => Rule.max(160),
        },
        {
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Image displayed when sharing on social media',
        },
      ],
    }),
  ],
})
