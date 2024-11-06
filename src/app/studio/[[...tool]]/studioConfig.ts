import { createClient } from '@sanity/client'
import config from '@/fresh_sanity_studio/sanity.config'

const workspaces = Array.isArray(config) ? config : [config];

export const client = createClient({
  projectId: workspaces[0].projectId,
  dataset: typeof window !== 'undefined' && window.location.pathname.includes('/staging')
    ? 'staging'
    : 'production',
  useCdn: false,
  apiVersion: '2024-03-19',
  token: process.env.SANITY_STUDIO_API_TOKEN || process.env.SANITY_API_READ_TOKEN
})

export const studioConfig = workspaces[0]