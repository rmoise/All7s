import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'collection',
  title: 'Collection',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true
      }
    }),
    defineField({
      name: 'items',
      title: 'Collection Items',
      type: 'array',
      of: [
        { type: 'reference', to: [
          { type: 'album' },
          { type: 'product' },
          { type: 'page' }
        ]}
      ]
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: true
    })
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image'
    }
  }
});

