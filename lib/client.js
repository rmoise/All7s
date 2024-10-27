import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getSanityConfig = () => {
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_TOKEN;  // Secure token variable for server-side

  const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    token,
    apiVersion: '2022-10-29',
    useCdn: process.env.NODE_ENV === 'production', // Use CDN in production for faster, cached responses
  };

  // Log Sanity config info to debug environment issues
  if (!config.projectId || !config.dataset) {
    console.warn("Sanity configuration is missing critical environment variables.");
  }
  console.log("Sanity Config:", {
    dataset: config.dataset,
    tokenExists: !!config.token,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
    useCdn: config.useCdn,
  });

  return config;
};

// Initialize Sanity client with configuration
export const client = createClient(getSanityConfig());

// Initialize image URL builder for Sanity images
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
