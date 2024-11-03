import { defineType, defineArrayMember } from 'sanity'

export default defineType({
  name: 'contentBlock',
  title: 'Content Block',
  type: 'object',
  fields: [
    {
      name: 'content',
      type: 'array',
      title: 'Content',
      of: [
        defineArrayMember({
          type: 'heroBanner'
        }),
        defineArrayMember({
          type: 'splash'
        }),
        defineArrayMember({
          type: 'about'
        }),
        defineArrayMember({
          type: 'musicBlock'
        }),
        defineArrayMember({
          type: 'videoBlock'
        }),
        defineArrayMember({
          type: 'backgroundVideoBlock'
        }),
        defineArrayMember({
          type: 'newsletter'
        })
      ],
    }
  ],
}) 