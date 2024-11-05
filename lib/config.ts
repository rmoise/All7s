import { ClientConfig } from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
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

// Debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('Sanity Config:', {
    projectId,
    dataset,
    apiVersion: sanityConfig.apiVersion,
    hasToken: !!apiToken,
    tokenLength: apiToken?.length
  })
}
