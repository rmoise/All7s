import { createClient } from '@sanity/client'
import config from '@/fresh_sanity_studio/sanity.config'

export const client = createClient({
  projectId: config.projectId,
  dataset: config.dataset,
  useCdn: false,
  apiVersion: '2024-03-13',
})

export const studioConfig = {
  ...config,
  plugins: config.plugins || [],
  schema: config.schema || { types: [] },
  document: config.document || {},
} 