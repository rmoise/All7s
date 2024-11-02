'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/fresh_sanity_studio/sanity.config'
import { useEffect, useState } from 'react'

export function Studio() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Check if NextStudio requires a different setup
  return (
    <NextStudio
      // Assuming NextStudio might require a different setup
      // Check the documentation for the correct props
    />
  )
}