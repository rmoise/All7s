import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import { getConfig } from './config'
import type { QueryParams, FilteredResponseQueryOptions } from '@sanity/client'
import type { SanityImage } from '@/types'
import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder'
import type { Environment } from './environment'

// Type guard to ensure valid environment
function isValidEnvironment(env: string): env is Environment {
  return ['production', 'staging'].includes(env)
}

// Debug environment configuration
const debugEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET
}
console.log('Sanity Client Environment:', debugEnv)

// Always use production dataset for development
const environment = process.env.NODE_ENV === 'development'
  ? 'production'
  : (process.env.NEXT_PUBLIC_ENVIRONMENT || 'production')

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
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: 'previewDrafts',
})

export const getClient = (usePreview = false) =>
  usePreview ? previewClient : client

export const imageBuilder = imageUrlBuilder(client)

interface ProductImage {
  asset: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
  alt?: string;
}

export const urlFor = (source: string | SanityImage | ProductImage | null | undefined): string => {
  if (typeof source === 'string') return source
  if (!source?.asset) return ''

  // Handle ProductImage type (from shop/cart)
  if ('url' in source.asset) {
    return source.asset.url || ''
  }

  // Handle SanityImage type
  if ('_ref' in source.asset) {
    try {
      return imageBuilder.image(source).url()
    } catch (error) {
      console.error('Error generating URL:', error)
      return ''
    }
  }

  return ''
}

export const urlForImage = (source: string | SanityImage | null | undefined, options?: {
  width?: number;
  quality?: number;
  blur?: number;
}): string => {
  if (typeof source === 'string') return source
  if (!source?.asset?._ref) return ''

  try {
    let imageUrl = imageBuilder.image(source)

    if (options?.width) {
      imageUrl = imageUrl.width(options.width)
    }
    if (options?.quality) {
      imageUrl = imageUrl.quality(options.quality)
    }
    if (options?.blur) {
      imageUrl = imageUrl.blur(options.blur)
    }

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