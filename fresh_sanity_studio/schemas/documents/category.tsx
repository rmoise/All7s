import { defineType, defineField } from 'sanity'
import { TagIcon } from '@sanity/icons'
import { Rule } from '@sanity/types'

export default defineType({
  name: 'category',
  title: 'Categories',
  type: 'document',
  icon: TagIcon,
  groups: [
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
      name: 'title',
      title: 'Category Name',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
      group: 'content'
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 90,
      },
      validation: (Rule: Rule) => Rule.required(),
      group: 'content'
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'content'
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
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
        }
      ]
    })
  ]
})