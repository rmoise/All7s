'use client';

import React from 'react';
import { StateContext } from '../context/StateContext';
import { NavbarProvider } from '@context/NavbarContext';
import { AudioProvider } from '../context/AudioContext';
import { YouTubeAPIProvider } from '../components/media/YouTubeAPIProvider';
import ClientLoading from '@components/common/ClientLoading';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StateContext>
      <NavbarProvider>
        <AudioProvider>
          <YouTubeAPIProvider>
            <ClientLoading>
              {children}
            </ClientLoading>
          </YouTubeAPIProvider>
        </AudioProvider>
      </NavbarProvider>
    </StateContext>
  );
}