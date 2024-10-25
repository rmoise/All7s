import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getSanityConfig = () => {
  let dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  let token = process.env.NEXT_PUBLIC_SANITY_TOKEN;

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
    dataset = process.env.NEXT_STAGING_SANITY_DATASET || 'staging';
    token = process.env.NEXT_STAGING_SANITY_TOKEN;
  }

  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    token,
    apiVersion: '2022-10-29',
    useCdn: process.env.NODE_ENV === 'production', // Use CDN only in production
    withCredentials: true, // Add this line to enable credentials
    ignoreBrowserTokenWarning: true, // Add this to ignore token warnings in the browser
  };
};

// Create a client instance
export const client = createClient(getSanityConfig());

// Helper function to build image URLs
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
