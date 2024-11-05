import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@sanity/client'

const NavbarContext = createContext()

export const NavbarProvider = ({ children }) => {
  const [navbarData, setNavbarData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-03-19',
    useCdn: false,
  })

  const fetchNavbarData = async () => {
    setLoading(true)

    try {
      const [settings, homePage] = await Promise.all([
        client.fetch(`*[_type == "settings"][0]{
          navbar{
            logo,
            navigationLinks[]{name, href},
            backgroundColor,
            isTransparent
          }
        }`),
        client.fetch(`*[_type == "home"][0]{
          contentBlocks[]{
            ...,
            _type == 'musicBlock' => {
              listenTitle,
              albums[]-> {
                _id,
                albumSource,
                embeddedAlbum {
                  embedUrl,
                  title,
                  artist,
                  platform,
                  releaseType,
                  imageUrl,
                  customImage {
                    asset-> {
                      url
                    }
                  }
                },
                customAlbum {
                  title,
                  artist,
                  releaseType,
                  customImage {
                    asset-> {
                      url
                    }
                  },
                  songs[] {
                    trackTitle,
                    "url": file.asset->url,
                    duration
                  }
                }
              }
            },
            _type == 'videoBlock' => {
              lookTitle,
              heroVideoLink,
              additionalVideos,
            },
          }
        }`),
      ])

      const fetchedNavbarData = settings.navbar
      const contentBlocks = homePage?.contentBlocks || []

      const musicBlock = contentBlocks.find(
        (block) => block._type === 'musicBlock'
      )
      const listenTitle = musicBlock?.listenTitle || 'LISTEN'

      const videoBlock = contentBlocks.find(
        (block) => block._type === 'videoBlock'
      )
      const lookTitle = videoBlock?.lookTitle || 'LOOK'

      // Generate IDs while preserving original case
      const listenId = listenTitle.replace(/\s+/g, '-')
      const lookId = lookTitle.replace(/\s+/g, '-')

      const updatedNavigationLinks = fetchedNavbarData.navigationLinks.map(
        (link) => {
          const linkHref = link.href.trim().toLowerCase()

          if (linkHref === '/#listen') {
            return { name: listenTitle, href: `/#${listenId}` }
          }
          if (linkHref === '/#look') {
            return { name: lookTitle, href: `/#${lookId}` }
          }
          return link
        }
      )

      const updatedNavbarData = {
        ...fetchedNavbarData,
        navigationLinks: updatedNavigationLinks,
      }

      setNavbarData(updatedNavbarData)
    } catch (error) {
      console.error('Error fetching navbar data:', error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNavbarData()
  }, [])

  return (
    <NavbarContext.Provider
      value={{ navbarData, loading, error, refreshNavbar: fetchNavbarData }}
    >
      {children}
    </NavbarContext.Provider>
  )
}

export const useNavbar = () => useContext(NavbarContext)
