import React from 'react'
import { SanityLive } from './live-client'

interface PreviewProviderProps {
  children: React.ReactNode
  preview?: boolean
}

export function PreviewProvider({ children, preview }: PreviewProviderProps) {
  return <SanityLive enabled={preview}>{children}</SanityLive>
}
export { SanityLive } from './live-client'

