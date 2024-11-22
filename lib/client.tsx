import { createClient, ClientConfig, ClientPerspective } from '@sanity/client'
import { sanityConfig } from './config'
import imageUrlBuilder from '@sanity/image-url'

const defaultConfig: ClientConfig = {
  ...sanityConfig,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published' as ClientPerspective,
  stega: {
    enabled: false,
    studioUrl: '/studio'
  },
  resultSourceMap: false,
  withCredentials: false
}

const previewConfig: ClientConfig = {
  ...sanityConfig,
  useCdn: false,
  perspective: 'previewDrafts' as ClientPerspective,
  stega: {
    enabled: false,
    studioUrl: '/studio'
  },
  resultSourceMap: false,
  withCredentials: false,
  token: process.env.SANITY_API_READ_TOKEN
}

// Create clients first
export const client = createClient(defaultConfig)
export const previewClient = createClient(previewConfig)

// Then create image builder using the client
const builder = imageUrlBuilder(client)
  .auto('format')
  .fit('max')
  .quality(80)

export const urlFor = (source: any) => builder.image(source)

export function getClient(preview = false) {
  if (preview) {
    
    return createClient({
      ...previewConfig,
      token: process.env.SANITY_API_READ_TOKEN
    })
  }
  return client
}
