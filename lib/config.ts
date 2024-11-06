import { ClientConfig } from '@sanity/client'

const getWorkspaceDataset = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.includes('/staging') ? 'staging' : 'production';
  }
  return process.env.SANITY_STUDIO_DATASET || 'production';
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x'
const dataset = getWorkspaceDataset();

console.log('Sanity Config Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  dataset,
  workspace: typeof window !== 'undefined' ? window.location.pathname : 'server'
});

const apiToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_TOKEN

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')

// Base configuration for website
export const sanityConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion: '2024-03-19',
  useCdn: false,
  token: apiToken,
  perspective: 'published'
}

// Studio configuration with optional token
export const studioConfig: ClientConfig = {
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_STUDIO_API_TOKEN || apiToken
}

// Preview configuration
export const previewConfig: ClientConfig = {
  ...sanityConfig,
  useCdn: false,
  token: process.env.SANITY_PREVIEW_TOKEN || apiToken,
  perspective: 'previewDrafts'
}
