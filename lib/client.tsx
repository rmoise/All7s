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
  perspective: 'previewDrafts'
})

// Helper to get appropriate client
export const getClient = (preview = false) =>
  preview ? previewClient : client

// Image builder
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

// Enhanced fetch with retries and logging
export async function safeFetch<T>(
  query: string,
  preview = false
): Promise<T | null> {
  const selectedClient = getClient(preview)
  const maxRetries = 3

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries} - Fetching with config:`, {
        projectId: selectedClient.config().projectId,
        dataset: selectedClient.config().dataset,
        apiVersion: selectedClient.config().apiVersion,
        hasToken: !!selectedClient.config().token,
        preview
      })

      const result = await selectedClient.fetch<T>(query)
      console.log('Fetch successful:', { hasData: !!result })
      return result
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        query
      })

      if (attempt === maxRetries) return null
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
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
