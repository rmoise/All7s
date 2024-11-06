// utils/imageUrlBuilder.tsx

import imageUrlBuilder from '@sanity/image-url'
import {createClient} from '@sanity/client'
import type {SanityImage as SanityImageType} from '../../types/sanity'
import { sanityConfig } from '../../lib/config'

// Export the SanityImage type
export type SanityImage = SanityImageType

const client = createClient(sanityConfig)
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
