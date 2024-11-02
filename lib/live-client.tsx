'use client'

import React from 'react'

interface SanityLiveProps {
  children: React.ReactNode
  enabled?: boolean
}

export function SanityLive({ children, enabled }: SanityLiveProps) {
  if (!enabled) return <>{children}</>

  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        padding: '0.5rem',
        background: '#000',
        color: '#fff',
        borderRadius: '0.25rem',
        fontSize: '0.875rem'
      }}>
        Preview Mode
      </div>
    </div>
  )
} 