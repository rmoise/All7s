import { createClient, ClientConfig } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = '2024-03-13';

// Validate environment variables
if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');

// Client configuration
const config: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Use CDN for better performance
};

// Create Sanity client for client-side
export const client = createClient(config);

// Image URL builder
const builder = imageUrlBuilder(client);
export const urlFor = (source: any) => builder.image(source);