'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../fresh_sanity_studio/sanity.config'
import { StudioProvider, StudioLayout } from 'sanity'

export default function Studio() {
  const studioConfig = Array.isArray(config) ? config[0] : config;

  // Get dataset based on environment
  const getDataset = () => {
    if (process.env.NODE_ENV === 'production') return 'production';
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') return 'staging';
    return process.env.SANITY_STUDIO_DATASET || 'production';
  };

  const dataset = getDataset();
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://all7z.com'
    : process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
      ? 'https://staging--all7z.netlify.app'
      : 'http://localhost:3000';

  console.log('Studio Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
    dataset,
    baseUrl
  });

  return (
    <StudioProvider
      config={{
        ...studioConfig,
        apiVersion: '2024-03-19',
        dataset,
        projectId: '1gxdk71x',
        token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_TOKEN,
        basePath: '/studio',
        baseUrl
      }}
    >
      <StudioLayout />
    </StudioProvider>
  )
}