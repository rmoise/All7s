// schemas/home.js

import {defineType, defineField} from 'sanity'
import type {SanityClient} from '@sanity/client'
import type {DocumentDefinition, FieldDefinition} from '@sanity/types'
import newsletter from '../objects/newsletter'

interface SanityDocument {
  _id: string
  _type: string
  _rev: string
  [key: string]: any
}

interface PublishContext {
  getClient: ({apiVersion}: {apiVersion: string}) => SanityClient
  document: SanityDocument
}

interface PreviewSelection {
  title?: string
}

// Define a custom type that extends DocumentDefinition
type CustomDocumentDefinition = Omit<DocumentDefinition, 'type'> & {
  type: 'document'
  __experimental_actions?: Array<'create' | 'update' | 'delete' | 'publish'>
  hooks?: {
    onPublish?: (context: PublishContext) => Promise<any>
  }
}

// Use type assertion instead of satisfies
export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ] as const,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      validation: (Rule: any) =>
        Rule.custom((blocks: any[]) => {
          if (!blocks) return true
          const hasInvalidKey = blocks.some((block) => !block._key)
          if (hasInvalidKey) {
            return 'All content blocks must have a _key property'
          }
          return true
        }),
      group: 'content',
      of: [
        {type: 'splash'},
        {type: 'about'},
        {type: 'musicBlock'},
        {type: 'videoBlock'},
        {type: 'backgroundVideoBlock'},
        {type: newsletter.name},
        {type: 'heroBanner'},
      ],
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'seo',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
      group: 'seo',
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare(selection: PreviewSelection) {
      return {
        title: selection.title || 'Home',
      }
    },
  },
  hooks: {
    onPublish: async ({getClient, document}: PublishContext) => {
      const client = getClient({apiVersion: '2024-05-28'})
      try {
        // Helper function to generate a unique key
        const generateKey = (type: string, index: number) => {
          return `${type}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }

        // Process content blocks
        const processedBlocks = document.contentBlocks
          ?.map((block: any, index: number) => {
            // If block is null or undefined, skip it
            if (!block) return null

            // If block already has a valid _key, keep it
            if (block._key && typeof block._key === 'string' && block._key.length > 0) {
              return block
            }

            // Generate a new key for the block
            return {
              ...block,
              _key: generateKey(block._type || 'unknown', index),
            }
          })
          .filter(Boolean) // Remove any null blocks

        // Create new document with processed blocks
        const newDocData = {
          ...document,
          _id: 'singleton-home',
          _type: 'home',
          contentBlocks: processedBlocks || [],
        }

        // Validate all blocks have keys
        const hasInvalidBlocks = newDocData.contentBlocks.some(
          (block: any) => !block._key || typeof block._key !== 'string',
        )

        if (hasInvalidBlocks) {
          console.error('Invalid blocks detected:', newDocData.contentBlocks)
          throw new Error('Cannot save document: Some content blocks are missing valid keys')
        }

        return newDocData
      } catch (error) {
        console.error('Error in onPublish:', error)
        throw error
      }
    },
  },
} as CustomDocumentDefinition)
