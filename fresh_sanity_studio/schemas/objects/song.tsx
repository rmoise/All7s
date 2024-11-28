import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'song',
  title: 'Song',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'trackNumber',
      title: 'Track Number',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Format: MM:SS (e.g., 03:45)',
      validation: (Rule) =>
        Rule.required()
            .regex(/^([0-5]?[0-9]):([0-5][0-9])$/, {
              name: 'time format',
              invert: false,
            })
            .error('Please use the format MM:SS (e.g., 03:45)'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      trackNumber: 'trackNumber',
      duration: 'duration',
    },
    prepare({title, trackNumber, duration}) {
      return {
        title: `${trackNumber}. ${title}`,
        subtitle: duration,
      }
    },
  },
}) 