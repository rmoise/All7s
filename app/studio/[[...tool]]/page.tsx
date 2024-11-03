'use client'

import dynamic from 'next/dynamic'
import config from '@/fresh_sanity_studio/sanity.config'
import productionConfig from '@/fresh_sanity_studio/sanity.production.config'
import { StudioProps } from 'sanity'

const StudioComponent = dynamic(() =>
  import('next-sanity/studio').then((mod) => mod.NextStudio)
, { ssr: false })

export default function StudioPage() {
  const studioConfig = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? productionConfig
    : config

  return (
    <StudioComponent
      config={studioConfig as StudioProps['config']}
    />
  )
}