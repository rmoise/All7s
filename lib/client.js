import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Dynamically use the correct token and dataset based on the environment
const isStaging = process.env.NODE_ENV === 'staging'; // Check if the environment is 'staging'

const sanityToken = isStaging ? process.env.NEXT_STAGING_SANITY_TOKEN : process.env.NEXT_PUBLIC_SANITY_TOKEN;
const sanityDataset = isStaging ? process.env.NEXT_STAGING_SANITY_DATASET : process.env.NEXT_PUBLIC_SANITY_DATASET;

export const client = sanityClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,  // Use project ID from environment variable
    dataset: sanityDataset,  // Use staging or production dataset dynamically
    apiVersion: '2022-10-29',  // API version remains constant
    useCdn: sanityDataset === 'production',  // Use CDN only in production
    token: sanityToken,  // Use appropriate token based on environment
    ignoreBrowserTokenWarning: true,  // Suppress token warning
});

// Helper function to build image URLs
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
