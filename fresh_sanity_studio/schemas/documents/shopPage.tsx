import { defineType, defineField } from 'sanity'
import { ComponentIcon } from '@sanity/icons'
import { Rule } from '@sanity/types'

export default defineType({
  name: 'shopPage',
  title: 'Shop Page',
  type: 'document',
  icon: ComponentIcon,
  __experimental_actions: ['update', 'publish'],
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
    }
  ],
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Main title displayed in the hero section',
      validation: (Rule: Rule) => Rule.required(),
      group: 'hero'
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Banner Image',
      type: 'image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility.',
          validation: (Rule: Rule) => Rule.required()
        }
      ],
      group: 'hero'
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Featured Products',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      group: 'content'
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
          validation: (Rule: Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          validation: (Rule: Rule) => Rule.max(160),
        },
        {
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Image displayed when sharing on social media'
        }
      ]
    })
  ]
})