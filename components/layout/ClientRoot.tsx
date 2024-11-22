'use client'

import dynamic from 'next/dynamic'
import { ReactNode } from 'react'
import { Providers } from '@/app/providers'

const ClientWrapper = dynamic<{ children: ReactNode }>(() =>
  import('./ClientWrapper').then(mod => mod.default), {
  ssr: false
})

interface ClientRootProps {
  children: ReactNode
  navbarData?: any
  footerData?: any
}

export default function ClientRoot({ children, navbarData, footerData }: ClientRootProps) {
  return (
    <ClientWrapper>
      <Providers>
        {children}
      </Providers>
    </ClientWrapper>
  )
} 