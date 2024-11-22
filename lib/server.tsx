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
  .auto('format')
  .fit('clip')
  .quality(100)
  .sharpen(0)
export const urlFor = (source: any) => builder.image(source)

// Add cache map
const CACHE_DURATION = 0
const queryCache = new Map<string, { data: any; timestamp: number }>()

// Enhanced fetch with retries and logging
export async function safeFetch<T>(
  query: string,
  params: QueryParams = {},
  usePreview = false
): Promise<T> {
  const cacheKey = `${query}-${JSON.stringify(params)}-${usePreview}`
  const now = Date.now()
  const cached = queryCache.get(cacheKey)

  // Return cached data if valid
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }

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

      // Cache the result
      queryCache.set(cacheKey, { data: result, timestamp: now })

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
