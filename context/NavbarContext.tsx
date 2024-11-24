'use client';

import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { createClient } from '@sanity/client'
import { getClient } from '@lib/sanity'
import { v4 as uuidv4 } from 'uuid'
import debounce from 'lodash/debounce'

interface NavbarLink {
  name: string
  href: string
}

interface NavbarData {
  navigationLinks: NavigationLink[]
  [key: string]: any
}

interface BlockTitles {
  listen: string
  look: string
}

interface NavigationLink {
  name: string
  href: string
  _key?: string
}

// Create a type for our refs
type SectionRefs = {
  lookRef: React.RefObject<HTMLDivElement>;
  listenRef: React.RefObject<HTMLDivElement>;
}

interface NavbarContextType {
  navbarData: NavbarData | null;
  error: Error | null;
  blockTitles: BlockTitles;
  updateBlockTitle: (type: 'listen' | 'look', newTitle: string) => Promise<void>;
  loading: boolean;
  refs: SectionRefs;
}

interface NavbarProviderProps {
  children: React.ReactNode
}

// Create default context value
const defaultContext: NavbarContextType = {
  navbarData: null,
  error: null,
  blockTitles: {
    listen: 'LISTEN',
    look: 'LOOK',
  },
  updateBlockTitle: async () => {},
  loading: true,
  refs: {
    lookRef: { current: null },
    listenRef: { current: null }
  }
}

// Create and export the context
export const NavbarContext = createContext<NavbarContextType>(defaultContext);

// Export custom hook
export const useNavbar = () => {
  const context = useContext(NavbarContext)
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarProvider')
  }
  return context
}

const getWriteClient = () => {
  const token = process.env.NEXT_PUBLIC_SANITY_TOKEN || process.env.SANITY_TOKEN
  if (!token) {
    console.warn('Sanity token is missing')
  }

  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    token: token,
    apiVersion: '2024-03-19',
    useCdn: true,
    perspective: 'published',
    withCredentials: true,
  })
}

interface InitialData {
  navigationLinks?: NavbarLink[]
  blockTitles?: {
    listen: string
    look: string
  }
}

export const NavbarProvider: React.FC<NavbarProviderProps> = ({ children }) => {
  const [navbarData, setNavbarData] = useState<NavbarData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)
  const [blockTitles, setBlockTitles] = useState<BlockTitles>({
    listen: 'LISTEN',
    look: 'LOOK'
  })

  const lookRef = useRef<HTMLDivElement>(null)
  const listenRef = useRef<HTMLDivElement>(null)

  const fetchInitialData = useCallback(async () => {
    if (!mounted.current) return;

    try {
      setLoading(true)
      const home = await getClient().fetch(`
        *[_type == "home"][0] {
          contentBlocks[] {
            _type,
            listenTitle,
            lookTitle
          }
        }
      `)

      if (home?.contentBlocks) {
        const musicBlock = home.contentBlocks.find((block: any) => block._type === 'musicBlock')
        const videoBlock = home.contentBlocks.find((block: any) => block._type === 'videoBlock')

        if (musicBlock?.listenTitle || videoBlock?.lookTitle) {
          setBlockTitles(prev => ({
            listen: musicBlock?.listenTitle || prev.listen,
            look: videoBlock?.lookTitle || prev.look
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError(error instanceof Error ? error : new Error('Failed to fetch data'))
    } finally {
      if (mounted.current) {
        setLoading(false)
      }
    }
  }, [])

  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true;
    fetchInitialData();

    return () => {
      mounted.current = false;
    };
  }, []);

  const updateBlockTitle = useCallback(async (type: 'listen' | 'look', newTitle: string) => {
    try {
      const response = await fetch('/api/navbar/update-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update title');
      }

      setBlockTitles(prev => ({
        ...prev,
        [type]: newTitle
      }));
    } catch (err) {
      console.error('Error updating title:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, []);

  // Add debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log({
        navbarData,
        blockTitles,
        timestamp: new Date().toISOString()
      });
    }
  }, [navbarData, blockTitles]);

  useEffect(() => {
    if (blockTitles && navbarData?.navigationLinks) {
      const updatedNavLinks = navbarData.navigationLinks.map(link => {
        const isLookLink = link.href?.toLowerCase().includes('look') || link.href?.toLowerCase().includes('/#look')
        const isListenLink = link.href?.toLowerCase().includes('listen') || link.href?.toLowerCase().includes('/#listen')

        if (isLookLink) {
          return { ...link, name: blockTitles.look }
        }
        if (isListenLink) {
          return { ...link, name: blockTitles.listen }
        }
        return link
      })

      setNavbarData(prev => ({
        ...prev!,
        navigationLinks: updatedNavLinks
      }))
    }
  }, [blockTitles, navbarData?.navigationLinks])

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        if (hash.toLowerCase().includes('look')) {
          setBlockTitles(prev => ({ ...prev, look: hash }));
        } else if (hash.toLowerCase().includes('listen')) {
          setBlockTitles(prev => ({ ...prev, listen: hash }));
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <NavbarContext.Provider
      value={{
        navbarData,
        error,
        blockTitles,
        updateBlockTitle,
        loading,
        refs: {
          lookRef,
          listenRef
        }
      }}
    >
      {children}
    </NavbarContext.Provider>
  )
}
