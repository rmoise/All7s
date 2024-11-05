// utils/imageUrlBuilder.tsx

import imageUrlBuilder from '@sanity/image-url'
import {createClient} from '@sanity/client'
import type {SanityImage as SanityImageType} from '../../types/sanity'

// Export the SanityImage type
export type SanityImage = SanityImageType

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || ''
const dataset = process.env.SANITY_STUDIO_DATASET || ''

console.log('Current environment:', process.env.NODE_ENV)
console.log('Using dataset:', dataset)

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
