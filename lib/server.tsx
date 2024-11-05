import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { sanityConfig, previewConfig } from './config'
import type { QueryParams } from 'next-sanity'

// Create server clients
export const serverClient = createClient(sanityConfig)
export const previewClient = createClient(previewConfig)

// Helper to select appropriate client
export const getServerClient = (usePreview = false) =>
  usePreview ? previewClient : serverClient

// Image builder
const builder = imageUrlBuilder(serverClient)
export const urlFor = (source: any) => builder.image(source)

// Enhanced fetch with retries and logging
export async function safeFetch<T>(
  query: string,
  params: QueryParams = {},
  usePreview = false
): Promise<T> {
  const client = getServerClient(usePreview)
  const maxRetries = 3
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1} - Fetching with config:`, {
        hasToken: !!client.config().token,
        tokenLength: client.config().token?.length,
        query: query.slice(0, 100) + '...',
        preview: usePreview,
      })

      const result = await client.fetch<T>(query, params)
      console.log('Fetch successful:', { hasData: !!result })
      return result
    } catch (error: any) {
      lastError = error
      console.error(`Attempt ${i + 1} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      })

      if (i === maxRetries - 1) break
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }

  throw lastError
}
