import React from 'react'
import { SanityLive } from './live-client'

interface PreviewProviderProps {
  children: React.ReactNode
  preview?: boolean
}

export function PreviewProvider({ children, preview }: PreviewProviderProps) {
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
  return <SanityLive enabled={preview && !isProduction}>{children}</SanityLive>
}

export { SanityLive } from './live-client'

