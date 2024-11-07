import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'
import type { SiteSettings } from '@/types/sanity'

// Create client with proper config
const defaultClient = createClient({
  ...sanityConfig,
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN
})

export const previewClient = createClient({
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_API_PREVIEW_TOKEN,
  perspective: 'previewDrafts'
})

export const getClient = (preview = false) =>
  preview ? previewClient : defaultClient

const builder = imageUrlBuilder(defaultClient)
export const urlFor = (source: any) => builder.image(source)

export async function safeFetch<T>(
  query: string,
  preview = false
): Promise<T | null> {
  const client = getClient(preview)
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    attempts++
    try {
      const data = await client.fetch(query)
      console.log('Fetch successful:', { hasData: !!data })
      return data
    } catch (error: any) {
      console.error(`Attempt ${attempts} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        preview,
        hasToken: !!client.config().token,
        tokenLength: client.config().token?.length
      })

      if (attempts === maxAttempts) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
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
