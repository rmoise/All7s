import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getSanityConfig = () => {
  let dataset, token;

  // Check if we are running in the browser (client-side)
  if (typeof window !== 'undefined') {
    dataset = localStorage.getItem('sanityDataset') || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    token = localStorage.getItem('sanityToken') || process.env.NEXT_PUBLIC_SANITY_TOKEN;
  } else {
    // Server-side rendering fallback
    dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    token = process.env.NEXT_PUBLIC_SANITY_TOKEN || null;
  }

  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    apiVersion: '2022-10-29',
    useCdn: dataset === 'production', // Only use CDN for production
    token, // Use token if necessary
  };
};

// Create Sanity client using the configuration
export const client = createClient(getSanityConfig());

// Helper function for image URLs
export const urlFor = (source) => imageUrlBuilder(client).image(source);
