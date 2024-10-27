import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const getSanityConfig = () => {
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_TOKEN; // Ensure this is correctly set

  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    token,
    apiVersion: '2022-10-29',
    useCdn: process.env.NODE_ENV === 'production' ? false : true,
    ignoreBrowserTokenWarning: true,
  };
};

export const client = createClient(getSanityConfig());

const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
