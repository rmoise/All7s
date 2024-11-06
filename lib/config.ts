import { ClientConfig } from '@sanity/client'

// Add debug logging at the top
console.log('Config Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET
})

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x'

const getDataset = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' || process.env.SANITY_STUDIO_DATASET === 'staging') {
    return 'staging';
  }
  return 'production';
};

const dataset = getDataset();

console.log('Sanity Config Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
  dataset
});

const apiToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_TOKEN

// Add more detailed error messages
if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset) throw new Error(`Missing NEXT_PUBLIC_SANITY_DATASET (env: ${process.env.NEXT_PUBLIC_ENVIRONMENT})`)
if (!apiToken) throw new Error('Missing Sanity API token')

// Base configuration for website
export const sanityConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion: '2024-03-19',
  useCdn: false,
  token: apiToken,
  perspective: 'published'
}

// Debug logging always
console.log('Sanity Config:', {
  projectId,
  dataset,
  apiVersion: sanityConfig.apiVersion,
  hasToken: !!apiToken,
  tokenLength: apiToken?.length
})

// Preview configuration for website
export const previewConfig: ClientConfig = {
  ...sanityConfig,
  useCdn: false,
  perspective: 'previewDrafts'
}

// Studio configuration
export const studioConfig: ClientConfig = {
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_STUDIO_API_TOKEN
}
