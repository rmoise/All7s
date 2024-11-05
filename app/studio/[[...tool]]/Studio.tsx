'use client'

import { NextStudio } from 'next-sanity/studio'
import sanityConfig from '@/fresh_sanity_studio/sanity.config'

export function Studio() {
  const config = Array.isArray(sanityConfig) ? sanityConfig[0] : sanityConfig;

  // Ensure apiVersion is explicitly set
  const studioConfig = {
    ...config,
    apiVersion: '2024-03-19',
  }

  return (
    <div className="h-screen">
      <NextStudio {...studioConfig} />
    </div>
  )
}