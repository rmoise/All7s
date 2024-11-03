'use client'

import { NextStudio } from 'next-sanity/studio'
import sanityConfig from '@/fresh_sanity_studio/sanity.config'

export function Studio() {
  // Assuming you want to use the first workspace configuration
  const config = Array.isArray(sanityConfig) ? sanityConfig[0] : sanityConfig;

  return (
    <div className="h-screen">
      <NextStudio
        {...config} // Spread the config properties directly
      />
    </div>
  )
}