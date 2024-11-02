'use client'

import dynamic from 'next/dynamic'
import type { SanityConfig } from 'sanity'
import config from '../../../fresh_sanity_studio/sanity.config'

// Create a type-safe studio component
const StudioComponent = dynamic(
  () => import('next-sanity/studio').then((mod) => {
    return mod.NextStudio as any // Force type to avoid mismatch
  }),
  {
    ssr: false,
  }
)

export default function StudioPage() {
  return (
    <StudioComponent
      // @ts-ignore - Known type mismatch between Sanity v2 and v3
      config={config}
    />
  )
}