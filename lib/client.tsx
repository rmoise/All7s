import { createClient as createSanityClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { QueryParams } from '@sanity/client'

// Get environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_READ_TOKEN
const apiVersion = '2024-03-13'

// Validate configuration
if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
if (!token) throw new Error('Missing SANITY_API_READ_TOKEN')

// Base configuration
const config = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'published',
} as const

// Create clients
export const client = createSanityClient(config)

export const previewClient = createSanityClient({
  ...config,
  perspective: 'previewDrafts',
})

// Helper function to get the appropriate client
export const getClient = (usePreview = false) =>
  usePreview ? previewClient : client

// Initialize image builder
const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

// Add safeFetch function with retry logic and proper typing
export async function safeFetch<T>(
  query: string,
  params: QueryParams = {}
): Promise<T> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await client.fetch<T>(query, params);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${i + 1} failed:`, {
        error,
        query,
        params,
      });

      // Only wait if we're going to retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to fetch from Sanity');
}

// Test connection function
export const testConnection = async () => {
  try {
    const result = await client.fetch('*[_type == "settings"][0]');
    console.log('✓ Sanity connection successful');
    return true;
  } catch (error) {
    console.error('× Sanity connection failed:', error);
    return false;
  }
};

// Run test connection
testConnection();
