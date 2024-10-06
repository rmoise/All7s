import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Dynamically use the correct token and dataset based on the environment
const isStaging = process.env.NEXT_PUBLIC_SANITY_DATASET === 'staging';

const sanityToken = isStaging ? process.env.NEXT_STAGING_SANITY_TOKEN : process.env.NEXT_PUBLIC_SANITY_TOKEN;
const sanityDataset = isStaging ? process.env.NEXT_STAGING_SANITY_DATASET : process.env.NEXT_PUBLIC_SANITY_DATASET;

export const client = sanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: sanityDataset,
  apiVersion: '2022-10-29',
  useCdn: sanityDataset === 'production',
  token: sanityToken,
  ignoreBrowserTokenWarning: true,
});

// Helper function to build image URLs
const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);
