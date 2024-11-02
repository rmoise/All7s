import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@sanity/client'

interface StudioContextType {
  dataset: string
  setDataset: (dataset: string) => void
  client: any // You might want to type this properly
}

const StudioContext = createContext<StudioContextType | undefined>(undefined)

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataset, setDataset] = useState(
    localStorage.getItem('sanityDataset') || 'staging'
  )

  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset,
    useCdn: false,
    apiVersion: '2024-03-13',
    token: process.env.SANITY_API_READ_TOKEN
  })

  useEffect(() => {
    localStorage.setItem('sanityDataset', dataset)
  }, [dataset])

  return (
    <StudioContext.Provider value={{ dataset, setDataset, client }}>
      {children}
    </StudioContext.Provider>
  )
}

export const useStudio = () => {
  const context = useContext(StudioContext)
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return context
}