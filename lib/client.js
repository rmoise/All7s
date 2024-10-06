import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Determine if the current environment is staging
const isStaging = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging';

// Retrieve environment variables without fallbacks
const sanityToken = isStaging
  ? process.env.NEXT_STAGING_SANITY_TOKEN
  : process.env.NEXT_PUBLIC_SANITY_TOKEN;

const sanityDataset = isStaging
  ? process.env.NEXT_STAGING_SANITY_DATASET
  : process.env.NEXT_PUBLIC_SANITY_DATASET;

// Error handling to ensure environment variables are set
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not defined.');
}

if (!sanityDataset) {
  throw new Error('Sanity dataset is not defined.');
}

if (!sanityToken) {
  throw new Error('Sanity token is not defined.');
}

// Temporary Logging (Remove before committing)
console.log('Sanity Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Sanity Dataset:', sanityDataset);
console.log('Sanity Token:', sanityToken ? 'Defined' : 'Not Defined');

// Initialize the Sanity client
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: sanityDataset,
  apiVersion: '2022-10-29', // Use a specific API version
  useCdn: sanityDataset === 'production', // Use CDN for production
  token: sanityToken,
  ignoreBrowserTokenWarning: true,
});

// Helper function to build image URLs
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
