import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { createClient } from '@sanity/client'
import { getClient } from '@/lib/client'
import { v4 as uuidv4 } from 'uuid'

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
    throw new Error('Sanity token is missing')
  }

  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    token: token,
    apiVersion: '2024-03-19',
    useCdn: false,
    perspective: 'published',
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
    console.log('Fetching initial data...')
    try {
      const [settings, home] = await Promise.all([
        getClient().fetch(`*[_type == "settings" && _id == "singleton-settings"][0]{
          navbar{
            navigationLinks[]{
              _key,
              name,
              href
            },
            backgroundColor,
            isTransparent,
            logo
          }
        }`),
        getClient().fetch(`*[_type == "home" && _id == "singleton-home"][0]{
          contentBlocks[]{
            _type,
            listenTitle,
            lookTitle
          }
        }`)
      ])

      // Only update if we have new data
      if (settings?.navbar) {
        setNavbarData(settings.navbar)
      }

      // Only update block titles if we have new data
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
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchInitialData();
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array since fetchInitialData is memoized

  const updateBlockTitle = useCallback(async (type: 'listen' | 'look', newTitle: string) => {
    const client = getWriteClient()

    try {
      // Update local state first
      setBlockTitles(prev => ({
        ...prev,
        [type]: newTitle
      }))

      // Update URL without page reload
      const newHash = `/#${newTitle}`
      if (typeof window !== 'undefined') {
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${newHash}`
        )
      }

      // Fetch current data with complete structure
      const [home, settings] = await Promise.all([
        client.fetch(`*[_type == "home" && _id == "singleton-home"][0]`),
        client.fetch(`*[_type == "settings" && _id == "singleton-settings"][0]`)
      ])

      if (!home || !settings) {
        throw new Error('Required documents not found')
      }

      // Create transaction
      const tx = client.transaction()

      // Update both documents in one transaction
      const updates = []

      // Update home document
      if (home.contentBlocks) {
        const updatedBlocks = home.contentBlocks.map((block: any) => {
          if (block._type === 'musicBlock' && type === 'listen') {
            return { ...block, listenTitle: newTitle }
          }
          if (block._type === 'videoBlock' && type === 'look') {
            return { ...block, lookTitle: newTitle }
          }
          return block
        })
        updates.push(tx.patch('singleton-home', p => p.set({ contentBlocks: updatedBlocks })))
      }

      // Update navbar data
      if (settings?.navbar?.navigationLinks) {
        const updatedNavLinks = settings.navbar.navigationLinks.map((link: NavigationLink) => {
          const isLookLink = link.href?.toLowerCase().includes('look') || link.href?.toLowerCase().includes('/#look')
          const isListenLink = link.href?.toLowerCase().includes('listen') || link.href?.toLowerCase().includes('/#listen')

          if ((isLookLink && type === 'look') || (isListenLink && type === 'listen')) {
            return { ...link, name: newTitle }
          }
          return link
        })
        updates.push(tx.patch('singleton-settings', p => p.set({ 'navbar.navigationLinks': updatedNavLinks })))

        // Execute all updates in one transaction
        await Promise.all(updates)
        await tx.commit()

        // Update local state after successful commit
        setNavbarData(prevData => {
          if (!prevData) return prevData
          return {
            ...prevData,
            navigationLinks: updatedNavLinks
          }
        })
      }
    } catch (error) {
      console.error('Error updating block title:', error)
      // Revert local state on error
      setBlockTitles(prev => ({
        ...prev,
        [type]: prev[type]
      }))
    }
  }, [])

  // Add debug logging
  useEffect(() => {
    console.log('NavbarData updated:', navbarData)
  }, [navbarData])

  useEffect(() => {
    console.log('Current block titles:', blockTitles);
    console.log('Current navbar data:', navbarData);
  }, [blockTitles, navbarData]);

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
  }, [blockTitles])

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
