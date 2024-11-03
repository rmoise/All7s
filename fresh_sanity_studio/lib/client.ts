import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: '1gxdk71x',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-03-19', // use today's date
  useCdn: false,
  token: process.env.SANITY_STUDIO_API_TOKEN
}) 