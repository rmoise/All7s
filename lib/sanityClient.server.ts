import { createClient, ClientConfig, QueryParams } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_READ_TOKEN;
const apiVersion = '2024-03-13';

// Validate environment variables
if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');
if (!token) throw new Error('Missing SANITY_API_READ_TOKEN');

// Client configuration
const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Disable CDN for fresh data
  token, // Read token for server-side operations
};

// Create Sanity clients
export const serverClient = createClient({
  ...config,
  perspective: 'published',
});

export const previewClient = createClient({
  ...config,
  perspective: 'previewDrafts',
});

// Helper to select the appropriate client
export const getServerClient = (usePreview: boolean = false) =>
  usePreview ? previewClient : serverClient;

// Image URL builder
const builder = imageUrlBuilder(serverClient);
export const urlFor = (source: any) => builder.image(source);

// Safer fetch function with retries
export async function safeFetch<T>(
  query: string,
  params: QueryParams = {},
): Promise<T> {
  const maxRetries = 3;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await serverClient.fetch<T>(query, params);
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, {
        message: error.message,
        stack: error.stack,
        query,
        params,
        projectId,
        dataset,
      });

      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw new Error('Failed to fetch from Sanity after multiple retries');
}

// Test connection with detailed logging
const testConnection = async () => {
  try {
    const result = await safeFetch('*[_type == "settings"][0]');
    console.log('✓ Sanity connection successful', result);
    return true;
  } catch (error) {
    console.error('× Sanity connection failed:', {
      error: error.message,
      projectId,
      dataset,
      hasToken: !!token,
      tokenLength: token?.length,
    });
    return false;
  }
};

// Run connection test
testConnection();
