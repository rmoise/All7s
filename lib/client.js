import { createClient } from '@sanity/client';  // Updated to use the new named export
import imageUrlBuilder from '@sanity/image-url';

// Dynamically check if we are in the staging environment
const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';

// Log environment variable values for debugging purposes
console.log('Client.js is executing in environment:', process.env.NEXT_PUBLIC_ENVIRONMENT);
console.log('Sanity Dataset (public):', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Sanity Token (staging):', process.env.NEXT_STAGING_SANITY_TOKEN);
console.log('Sanity Token (production):', process.env.NEXT_PUBLIC_SANITY_TOKEN);
console.log('Sanity Dataset (staging):', process.env.NEXT_STAGING_SANITY_DATASET);
console.log('Sanity Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);

// Dynamically use the correct token and dataset based on the environment
const sanityToken = isStaging ? process.env.NEXT_STAGING_SANITY_TOKEN : process.env.NEXT_PUBLIC_SANITY_TOKEN;
const sanityDataset = isStaging ? process.env.NEXT_STAGING_SANITY_DATASET : process.env.NEXT_PUBLIC_SANITY_DATASET;

console.log('Using Sanity Token:', sanityToken);
console.log('Using Sanity Dataset:', sanityDataset);

// Initialize the Sanity client with the correct environment configuration
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: sanityDataset,
  apiVersion: '2022-10-29',  // Or another version if needed
  useCdn: sanityDataset === 'production',  // Use CDN only for production builds
  token: sanityToken,
  ignoreBrowserTokenWarning: true,
});

// Helper function to build image URLs using the Sanity client
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
