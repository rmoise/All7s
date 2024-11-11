import { createClient } from '@sanity/client'
import type { ClientConfig, ClientPerspective } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig } from './config'
import type { SiteSettings } from '../types/sanity'

// Add debug logging for token presence
const getToken = (preview = false) => {
  const token = preview
    ? process.env.SANITY_API_READ_TOKEN
    : process.env.NEXT_PUBLIC_SANITY_TOKEN

  console.log('Token Debug:', {
    preview,
    hasToken: !!token,
    tokenLength: token?.length,
    environment: process.env.NODE_ENV,
    isServer: typeof window === 'undefined'
  })

  return token
}

const config: ClientConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-19',
  useCdn: false,
  token: getToken(),
  perspective: 'published',
  withCredentials: false
}

// Create clients with proper error handling
const createSafeClient = (clientConfig: ClientConfig) => {
  try {
    return createClient(clientConfig)
  } catch (error) {
    console.error('Failed to create Sanity client:', error)
    throw error
  }
}

export const client = createSafeClient(config)

export const getClient = (preview = false) => {
  return createSafeClient({
    ...config,
    token: getToken(preview),
    useCdn: false
  })
}

export const previewClient = createClient({
  ...config,
  useCdn: false,
  token: process.env.SANITY_API_PREVIEW_TOKEN,
  perspective: 'previewDrafts' as ClientPerspective
})

const builder = imageUrlBuilder(client)
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
      console.log('Attempting Sanity fetch:', {
        attempt: attempts,
        preview,
        hasToken: !!client.config().token,
        tokenLength: client.config().token?.length,
        query: query.slice(0, 100)
      })

      const data = await client.fetch(query)
      console.log('Fetch successful:', { hasData: !!data })
      return data
    } catch (error: any) {
      console.error(`Attempt ${attempts} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        preview,
        hasToken: !!client.config().token
      })

      if (attempts === maxAttempts) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000))
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
