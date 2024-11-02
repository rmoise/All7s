import React from 'react'
import {defineType, defineField} from 'sanity'

interface PreviewProps {
  title: string
  primaryColor?: {
    hex: string
  }
}

const ColorPreview: React.FC<{color?: string}> = ({color}) => (
  <div
    style={{
      width: '2rem',
      height: '2rem',
      backgroundColor: color || '#000',
      borderRadius: '4px',
    }}
  />
)

export default defineType({
  name: 'colorTheme',
  title: 'Color Theme',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Theme Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'color',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'secondaryColor',
      title: 'Secondary Color',
      type: 'color',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'color',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'color',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      primaryColor: 'primaryColor',
    },
    prepare(selection: PreviewProps) {
      const ColorPreviewElement = <ColorPreview color={selection.primaryColor?.hex} />
      return {
        title: selection.title || 'Untitled Theme',
        media: ColorPreviewElement,
      }
    },
  },
})