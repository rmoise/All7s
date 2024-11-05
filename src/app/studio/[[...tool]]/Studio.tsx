'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../fresh_sanity_studio/sanity.config'
import { StudioProvider, StudioLayout } from 'sanity'

export default function Studio() {
  const studioConfig = Array.isArray(config) ? config[0] : config;

  return (
    <StudioProvider
      config={{
        ...studioConfig,
        apiVersion: '2024-03-19',
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
      }}
    >
      <StudioLayout />
    </StudioProvider>
  )
}