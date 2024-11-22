'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface YouTubeAPIContextType {
  apiReady: boolean
}

const YouTubeAPIContext = createContext<YouTubeAPIContextType>({ apiReady: false })

export const useYouTubeAPI = () => useContext(YouTubeAPIContext)

interface YouTubeAPIProviderProps {
  children: React.ReactNode
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export const YouTubeAPIProvider: React.FC<YouTubeAPIProviderProps> = ({ children }) => {
  const [apiReady, setApiReady] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API is ready.")
        setApiReady(true)
      }
    } else if (typeof window !== 'undefined') {
      setApiReady(true)
    }
  }, [])

  return (
    <YouTubeAPIContext.Provider value={{ apiReady }}>
      {children}
    </YouTubeAPIContext.Provider>
  )
}
