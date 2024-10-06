import { createClient } from '@sanity/client';  // Updated to use the new named export
import imageUrlBuilder from '@sanity/image-url';

// Dynamically check if we are in the staging environment
const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';

// Fallbacks in case environment variables are undefined
const sanityToken = isStaging
  ? process.env.NEXT_STAGING_SANITY_TOKEN || 'default-staging-token'
  : process.env.NEXT_PUBLIC_SANITY_TOKEN || 'default-production-token';

const sanityDataset = isStaging
  ? process.env.NEXT_STAGING_SANITY_DATASET || 'default-staging-dataset'
  : process.env.NEXT_PUBLIC_SANITY_DATASET || 'default-production-dataset';

// Initialize the Sanity client with the correct environment configuration
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'default-project-id',
  dataset: sanityDataset,
  apiVersion: '2022-10-29',  // Or another version if needed
  useCdn: sanityDataset === 'production',  // Use CDN only for production builds
  token: sanityToken,
  ignoreBrowserTokenWarning: true,
});

// Helper function to build image URLs using the Sanity client
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
