import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { getConfig } from './config'
import type { QueryParams, FilteredResponseQueryOptions } from '@sanity/client'
import type { SanityImage } from '@types'
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import type { Environment } from './environment'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

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

export const fetchSanity = async <T>(
  query: string,
  params: QueryParams = {},
  preview = false,
  options?: FilteredResponseQueryOptions
): Promise<T> => {
  return getClient(preview).fetch<T>(query, params, options)
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
