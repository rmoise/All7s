import { createClient } from '@sanity/client'
import config from '@/fresh_sanity_studio/sanity.config'

export const client = createClient({
  projectId: config.projectId,
  dataset: process.env.NODE_ENV === 'production' ? 'production' : process.env.SANITY_STUDIO_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-19',
  token: process.env.SANITY_STUDIO_API_TOKEN || process.env.SANITY_API_READ_TOKEN
})

export const studioConfig = {
  ...config,
  plugins: config.plugins || [],
  schema: config.schema || { types: [] },
  document: config.document || {},
}