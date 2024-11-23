'use client';

import React from 'react'
import { StateContext } from '@context/StateContext'
import { NavbarProvider } from '@context/NavbarContext'
import { AudioProvider } from '@context/AudioContext'
import { YouTubeAPIProvider } from '@components/media/YouTubeAPIProvider'

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <StateContext>
      <NavbarProvider>
        <AudioProvider>
          <YouTubeAPIProvider>
            {children}
          </YouTubeAPIProvider>
        </AudioProvider>
      </NavbarProvider>
    </StateContext>
  )
}