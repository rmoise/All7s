import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'
import type { SiteSettings } from '@/types/sanity'

// Create client with proper config
export const client = createClient({
  ...sanityConfig,
  useCdn: false,
  withCredentials: false
})

export const previewClient = createClient({
  ...sanityConfig,
  useCdn: false,
  withCredentials: false,
  token: process.env.SANITY_PREVIEW_TOKEN || process.env.SANITY_TOKEN,
  perspective: 'previewDrafts'
})

// Helper to get appropriate client
export const getClient = (preview = false) => {
  const client = createClient({
    ...sanityConfig,
    useCdn: !preview,
    token: preview ? process.env.SANITY_API_PREVIEW_TOKEN : process.env.SANITY_API_READ_TOKEN,
  })
  return client
}

// Image builder
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

// Enhanced fetch with retries and logging
export async function safeFetch<T>(
  query: string,
  preview = false
): Promise<T | null> {
  const client = getClient(preview)
  console.log('Sanity Config Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    dataset: client.config().dataset,
    workspace: 'server',
  })

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    attempts++
    try {
      console.log(`Attempt ${attempts}/${maxAttempts} - Fetching with config:`, {
        projectId: client.config().projectId,
        dataset: client.config().dataset,
        apiVersion: client.config().apiVersion,
        hasToken: !!client.config().token,
        preview
      })

      const data = await client.fetch(query)
      console.log('Fetch successful:', { hasData: !!data })
      return data
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error)
      if (attempts === maxAttempts) {
        throw error
      }
    }
  }
  return null
}

// Settings fetch helper with proper typing
export const getSanitySettings = async (preview = false): Promise<SiteSettings | null> => {
  return safeFetch<SiteSettings>(`
    *[_type == "settings" && _id == "singleton-settings"][0] {
      title,
      seo,
      favicon,
      navbar {
        logo,
        navigationLinks[] {
          name,
          href
        },
        backgroundColor,
        isTransparent
      },
      footer {
        copyrightText,
        footerLinks[] {
          _key,
          text,
          url
        },
        socialLinks[] {
          _key,
          platform,
          url,
          iconUrl
        },
        fontColor,
        alignment
      }
    }
  `, preview)
}
