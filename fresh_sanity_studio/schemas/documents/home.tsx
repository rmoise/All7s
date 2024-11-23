// schemas/home.js

import {defineType, defineField} from 'sanity'
import type {SanityClient} from '@sanity/client'
import newsletter from '../objects/newsletter'

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
  // @ts-ignore -- experimental actions are valid but not typed
  __experimental_actions: ['update', 'publish'],
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
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'content'
    }),
    defineField({
      name: 'contentBlocks',
      title: 'Content Blocks',
      type: 'array',
      validation: (Rule) => Rule.required(),
      group: 'content',
      of: [
        {
          type: 'splash',
          title: 'Splash'
        },
        {
          type: 'about',
          title: 'About'
        },
        {
          type: 'musicBlock',
          title: 'Music Block'
        },
        {
          type: 'videoBlock',
          title: 'Video Block'
        },
        {
          type: 'backgroundVideoBlock',
          title: 'Background Video Block'
        },
        {
          type: newsletter.name,
          title: newsletter.title
        },
        {
          type: 'heroBanner',
          title: 'Hero Banner'
        }
      ],
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'seo'
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      validation: (Rule) => Rule.required(),
      group: 'seo'
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      validation: (Rule) => Rule.required(),
      options: {
        hotspot: true,
      },
      group: 'seo'
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

        // Preserve existing content blocks and ensure both LISTEN and LOOK sections are properly handled
        const preservedData = {
          contentBlocks: currentDoc.contentBlocks?.map((block: any, index: number) => ({
            ...block,
            _key: block._key,
            order: block.order ?? index
          })) || []
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
            if (block._type === 'musicBlock') {
              return {
                ...block,
                listenTitle: block.listenTitle || preservedData.contentBlocks.find(
                  (b: any) => b._type === 'musicBlock'
                )?.listenTitle || 'LISTEN'
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

