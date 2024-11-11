
// schemas/home.js

import {defineType, defineField} from 'sanity'
import type {SanityClient} from '@sanity/client'

interface SanityDocument {
  _id: string
  _type: string
  _rev: string
  [key: string]: any
}

interface PublishContext {
  getClient: ({ apiVersion }: { apiVersion: string }) => SanityClient
  document: SanityDocument
}

interface PreviewSelection {
  title?: string
}

export default defineType({
  name: 'home',
  title: 'Home',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      of: [
        {type: 'splash'},
        {type: 'about'},
        {type: 'musicBlock'},
        {type: 'videoBlock'},
        {type: 'backgroundVideoBlock'},
        {type: 'newsletter'},
        {type: 'heroBanner'},
      ],
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
    onPublish: async ({ getClient, document }: PublishContext) => {
      const client = getClient({ apiVersion: '2024-05-28' })

      try {
        // Get current document
        const currentDoc = await client.getDocument('singleton-home')

        if (!currentDoc) {
          throw new Error('Home document not found')
        }

        // Preserve existing content blocks and ensure LOOK section is properly handled
        const preservedData = {
          contentBlocks: currentDoc.contentBlocks?.map((block: any) => {
            if (block._type === 'videoBlock') {
              return {
                ...block,
                lookTitle: block.lookTitle || 'LOOK', // Ensure LOOK title exists
                _key: block._key // Preserve keys
              }
            }
            return block
          }) || []
        }

        // Create new document data
        const newDocData = {
          ...document,
          _id: 'singleton-home',
          _type: 'home',
          contentBlocks: document.contentBlocks?.map((block: any) => {
            if (block._type === 'videoBlock') {
              return {
                ...block,
                lookTitle: block.lookTitle || preservedData.contentBlocks.find(
                  (b: any) => b._type === 'videoBlock'
                )?.lookTitle || 'LOOK'
              }
            }
            return block
          }) || preservedData.contentBlocks
        }

        const transaction = client.transaction()
        transaction.delete('drafts.singleton-home')
        transaction.createOrReplace(newDocData)

        await transaction.commit({
          visibility: 'sync'
        })

        return true
      } catch (error) {
        console.error('Publish error:', error)
        throw error
      }
    }
  }
})

