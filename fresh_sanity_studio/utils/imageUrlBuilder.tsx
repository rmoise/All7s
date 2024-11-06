// utils/imageUrlBuilder.tsx

import imageUrlBuilder from '@sanity/image-url'
import {createClient} from '@sanity/client'
import type {SanityImage as SanityImageType} from '../../types/sanity'

// Export the SanityImage type
export type SanityImage = SanityImageType

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'

// Enhanced dataset detection
const getDataset = () => {
  // Check window location first for production
  if (typeof window !== 'undefined' && window.location.hostname === 'all7z.sanity.studio') {
    return 'production';
  }

  // Then check environment variables
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return 'production';
  }

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' || process.env.SANITY_STUDIO_DATASET === 'staging') {
    return 'staging';
  }

  return process.env.SANITY_STUDIO_DATASET || 'production';
};

const dataset = getDataset();

console.log('Image Builder Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  dataset,
  projectId
});

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-03-19',
  useCdn: true
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
