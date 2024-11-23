// utils/imageUrlBuilder.tsx

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageAsset } from '../sanity.types'

// Define the SanityImage type based on the generated types
export type SanityImage = {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
}

// Use environment variables directly instead of getCurrentEnvironment
const dataset = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' ? 'staging' : 'production'

console.log('ImageUrlBuilder Environment:', {
  dataset,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT
})

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset,
  apiVersion: '2024-03-19',
  useCdn: process.env.NODE_ENV === 'production',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage | null | undefined): string {
  if (!source?.asset?._ref) {
    return ''
  }

  try {
    return builder.image(source).url()
  } catch (error) {
    console.error('Error generating URL:', error)
    return ''
  }
}
