import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getSanityConfig = () => {
  // Ensure the correct dataset and token are selected based on the deployment environment
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.NEXT_PUBLIC_SANITY_TOKEN;

  const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    token,
    apiVersion: '2022-10-29',
    useCdn: process.env.NODE_ENV === 'production' ? false : true, // Disable CDN in production for real-time data
    ignoreBrowserTokenWarning: true,
  };

  // Log configurations to verify settings in production and development
  console.log("Sanity Config:", {
    dataset: config.dataset,
    tokenExists: !!config.token,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
    useCdn: config.useCdn,
  });

  return config;
};

// Create a Sanity client instance
export const client = createClient(getSanityConfig());

// Helper function to build image URLs
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
