import { ClientConfig, ClientPerspective } from '@sanity/client'

// Define the enhanced config type
export interface EnhancedClientConfig extends ClientConfig {
  stega?: {
    enabled: boolean
    studioUrl?: string
  }
  listen?: {
    enabled: boolean
    includeTypes?: string[]
    visibility?: 'query' | 'mutation'
    subscribeTo?: string[]
    events?: string[]
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Initialize tokens with proper hierarchy
const authToken = process.env.SANITY_AUTH_TOKEN
const studioToken = process.env.SANITY_STUDIO_API_TOKEN
const readToken = process.env.SANITY_API_READ_TOKEN
const previewToken = process.env.SANITY_PREVIEW_TOKEN

// Debug logging
console.log('Token Status:', {
  hasAuthToken: !!authToken,
  hasStudioToken: !!studioToken,
  hasReadToken: !!readToken,
  hasPreviewToken: !!previewToken,
  isServer: typeof window === 'undefined',
  isStudio: typeof window !== 'undefined' && window.location.pathname.includes('/studio')
})

// Synchronous token getter with preview support
const getToken = (requireAuth = false): string | undefined => {
  // Special case for Sanity Studio
  if (typeof window !== 'undefined' && window.location.pathname.includes('/studio')) {
    return studioToken || authToken;  // Maintain studio token fallback
  }

  // Server-side: use auth token for mutations, read token for queries
  if (typeof window === 'undefined') {
    return requireAuth ? (authToken || studioToken) : readToken;
  }

  // Client-side: use read token for preview, or preview token if available
  return previewToken || readToken;
};

// Base configuration for website
export const sanityConfig: EnhancedClientConfig = {
  projectId,
  dataset,
  apiVersion: '2024-03-19',
  useCdn: false,
  token: readToken,
  perspective: 'published' as ClientPerspective,
  withCredentials: true,
  stega: {
    enabled: false,
    studioUrl: '/studio'
  },
  apiHost: 'https://api.sanity.io',
  listen: {
    enabled: false,
    includeTypes: [],
    visibility: 'query',
    subscribeTo: ['mutation'],
    events: ['mutation']
  }
}

// Studio configuration
export const studioConfig: EnhancedClientConfig = {
  ...sanityConfig,
  token: getToken(true),
  stega: {
    enabled: false,
    studioUrl: '/studio'
  }
}

// Preview configuration with WebSocket support
export const previewConfig: EnhancedClientConfig = {
  ...sanityConfig,
  token: getToken(true),
  perspective: 'previewDrafts',
  useCdn: false,
  stega: {
    enabled: true,
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL
  }
}

