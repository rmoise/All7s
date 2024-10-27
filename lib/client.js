import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getSanityConfig = () => {
  let dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  let token = process.env.NEXT_PUBLIC_SANITY_TOKEN;

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') {
    dataset = process.env.NEXT_STAGING_SANITY_DATASET || 'staging';
    token = process.env.NEXT_STAGING_SANITY_TOKEN;
  }

  const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    token,
    apiVersion: '2022-10-29',
    useCdn: process.env.NODE_ENV === 'production' ? false : true, // Temporarily disable CDN in production
    ignoreBrowserTokenWarning: true,
  };

  // Log configurations to verify settings in production
  if (process.env.NODE_ENV === 'production') {
    console.log("Sanity Config in Production:", config);
  } else {
    console.log("Sanity Configuration in Development:", {
      Dataset: config.dataset,
      "Token Loaded": !!config.token,
      "Project ID": config.projectId,
    });
  }

  return config;
};

// Create a client instance
export const client = createClient(getSanityConfig());

// Helper function to build image URLs
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
