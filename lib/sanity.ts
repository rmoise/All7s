import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { getConfig } from './config'
import type { QueryParams, FilteredResponseQueryOptions } from '@sanity/client'
import type { SanityImage } from '@types'
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import type { Environment } from './environment'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
const queryCache = new Map<string, { data: any; timestamp: number }>()
const fileCache = new Map<
  string,
  { url: string; data: ArrayBuffer; timestamp: number }
>()

// Cache cleanup interval (every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      const now = Date.now()
      // Cleanup query cache
      Array.from(queryCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_DURATION) {
          queryCache.delete(key)
        }
      })
      // Cleanup file cache
      Array.from(fileCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_DURATION) {
          fileCache.delete(key)
        }
      })
    },
    10 * 60 * 1000
  )
}

// Cache for audio file metadata
const audioMetadataCache = new Map<
  string,
  { duration: number; lastFetched: number }
>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Type guard to ensure valid environment
function isValidEnvironment(env: string): env is Environment {
  return ['production', 'staging'].includes(env)
}

// Debug environment configuration
const debugEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
}
console.log('Sanity Client Environment:', debugEnv)

// Always use production dataset for development
const environment =
  process.env.NODE_ENV === 'development'
    ? 'production'
    : process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'

if (!isValidEnvironment(environment)) {
  console.error('Invalid environment configuration:', { environment, debugEnv })
  throw new Error(`Invalid environment: ${environment}`)
}

const config = getConfig(environment)

const clientConfig = {
  projectId: config.projectId,
  dataset: config.dataset,
  apiVersion: config.apiVersion,
  useCdn: config.useCdn,
}

export const client = createClient(clientConfig)

export const previewClient = createClient({
  ...clientConfig,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'previewDrafts',
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  },
})

export const getClient = (usePreview = false) => {
  if (usePreview && !process.env.SANITY_API_TOKEN) {
    console.warn('No preview token found')
  }
  return usePreview ? previewClient : client
}

export const imageBuilder = imageUrlBuilder(client)

interface ProductImage {
  asset: {
    _id: string
    url: string
    metadata?: {
      dimensions: {
        width: number
        height: number
        aspectRatio: number
      }
    }
  }
  alt?: string
}

export function urlFor(source: SanityImageSource): ImageUrlBuilder {
  if (!source) {
    console.warn('No source provided to urlFor')
    return imageBuilder.image({})
  }

  try {
    const builder = imageBuilder.image(source)
    return builder.auto('format').fit('max').quality(80)
  } catch (error) {
    console.error('Error in urlFor:', error)
    return imageBuilder.image({})
  }
}

export const urlForImage = (
  source: string | SanityImage | null | undefined,
  options?: {
    width?: number
    quality?: number
    blur?: number
  }
): string => {
  if (!source) return ''
  if (typeof source === 'string') return source
  if (!source?.asset?._ref) return ''

  try {
    let imageUrl = imageBuilder
      .image(source)
      .auto('format')
      .fit('max')
      .quality(options?.quality || 80)

    if (options?.width) {
      imageUrl = imageUrl.width(options.width)
    }

    // Return direct Sanity URL without Netlify image optimization
    return imageUrl.url()
  } catch (error) {
    console.error('Error generating URL:', error)
    return ''
  }
}

// Enhanced fetchSanity with caching and tags
export const fetchSanity = async <T>(
  query: string,
  params: QueryParams = {},
  preview = false,
  options?: FilteredResponseQueryOptions & {
    tags?: string[]
    next?: {
      revalidate?: number | false
      tags?: string[]
    }
  }
): Promise<T> => {
  const cacheKey = JSON.stringify({ query, params, preview })
  const now = Date.now()
  const cached = queryCache.get(cacheKey)

  // Return cached data if valid and not in preview mode
  if (!preview && cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }

  // Determine cache tags based on query content
  const defaultTags = ['sanity']
  if (query.includes('_type == "album"')) defaultTags.push('albums', 'music')
  if (query.includes('_type == "post"')) defaultTags.push('posts', 'blog')
  if (query.includes('_type == "product"')) defaultTags.push('products', 'shop')
  if (query.includes('_type == "settings"'))
    defaultTags.push('settings', 'global')

  // Merge default tags with provided tags
  const tags = Array.from(new Set([...defaultTags, ...(options?.tags || [])]))

  // Fetch fresh data with cache configuration
  const data = await getClient(preview).fetch<T>(query, params, {
    ...options,
    next: {
      ...options?.next,
      tags,
      // Default to no revalidation in preview mode, 60 seconds otherwise
      revalidate: preview ? 0 : (options?.next?.revalidate ?? 60),
    },
  })

  // Cache the result if not in preview mode
  if (!preview) {
    queryCache.set(cacheKey, { data, timestamp: now })
  }

  return data
}

// Enhanced fetchSanityFile with caching and content-based cache duration
export const fetchSanityFile = async (
  fileUrl: string,
  options?: {
    maxAge?: number
    tags?: string[]
  }
): Promise<ArrayBuffer> => {
  const now = Date.now()
  const cached = fileCache.get(fileUrl)

  // Determine cache duration based on file type
  const isAudio = fileUrl.match(/\.(mp3|wav|ogg|m4a)$/i)
  const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  const maxAge =
    options?.maxAge ||
    (isAudio
      ? 24 * 60 * 60 * 1000
      : isImage
        ? 7 * 24 * 60 * 60 * 1000
        : CACHE_DURATION)

  // Return cached file if valid
  if (cached && now - cached.timestamp < maxAge) {
    return cached.data
  }

  // Fetch fresh file
  const response = await fetch(fileUrl, {
    next: {
      revalidate: maxAge / 1000, // Convert to seconds
      tags: options?.tags,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()

  // Cache the file
  fileCache.set(fileUrl, { url: fileUrl, data: buffer, timestamp: now })

  return buffer
}

const getPreviewUrl = (doc: any) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://all7z.com'
  const previewSecret = process.env.SANITY_PREVIEW_SECRET

  switch (doc._type) {
    case 'home':
      return `${baseUrl}/api/preview?secret=${previewSecret}&preview=1`
    case 'post':
      return `${baseUrl}/api/preview?secret=${previewSecret}&preview=1&type=post&slug=${doc?.slug?.current}`
    case 'page':
      return `${baseUrl}/api/preview?secret=${previewSecret}&preview=1&type=page&slug=${doc?.slug?.current}`
    default:
      return `${baseUrl}/api/preview?secret=${previewSecret}&preview=1`
  }
}

async function fetchAudioDuration(fileRef: string): Promise<number> {
  try {
    const fileUrl = urlFor(fileRef).url()

    // First try a HEAD request to get Content-Duration
    const headResponse = await fetch(fileUrl, {
      method: 'HEAD',
      next: { revalidate: CACHE_TTL / 1000 },
    })

    const contentDuration = headResponse.headers.get('Content-Duration')
    if (contentDuration) {
      return parseFloat(contentDuration)
    }

    // If no Content-Duration, fetch just the first few bytes
    const response = await fetch(fileUrl, {
      headers: { Range: 'bytes=0-8192' }, // First 8KB should contain metadata
      next: { revalidate: CACHE_TTL / 1000 },
    })

    const buffer = await response.arrayBuffer()

    // Try to get duration from metadata without loading full file
    if (typeof window !== 'undefined') {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const audioContext = new AudioContext()
        try {
          const audioBuffer = await audioContext.decodeAudioData(buffer)
          return audioBuffer.duration
        } catch {
          // If we can't decode the partial file, fall back to stored duration
          return 0
        } finally {
          await audioContext.close()
        }
      }
    }

    return 0
  } catch (error) {
    console.error('Error getting audio duration:', error)
    return 0
  }
}

// Cache audio durations in memory and localStorage
const DURATION_CACHE_KEY = 'audio_durations_cache'
let memoryDurationCache: Record<string, number> = {}

// Load cached durations from localStorage on init
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem(DURATION_CACHE_KEY)
    if (cached) {
      memoryDurationCache = JSON.parse(cached)
    }
  } catch (e) {
    console.warn('Failed to load audio duration cache:', e)
  }
}

export async function getAudioDuration(fileRef: string): Promise<number> {
  // Check memory cache first
  if (memoryDurationCache[fileRef]) {
    return memoryDurationCache[fileRef]
  }

  try {
    const duration = await fetchAudioDuration(fileRef)
    if (duration > 0) {
      // Cache the duration
      memoryDurationCache[fileRef] = duration
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            DURATION_CACHE_KEY,
            JSON.stringify(memoryDurationCache)
          )
        } catch (e) {
          console.warn('Failed to cache audio duration:', e)
        }
      }
    }
    return duration
  } catch (error) {
    console.error('Error fetching audio duration:', error)
    return 0
  }
}
