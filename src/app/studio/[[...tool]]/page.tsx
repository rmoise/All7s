/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

'use client'

import { NextStudio } from 'next-sanity/studio'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import config from '@fresh_sanity_studio/sanity.config'
import type { WorkspaceOptions } from 'sanity'

type WorkspaceConfig = WorkspaceOptions & {
  name: string
  basePath: string
  dataset: string
}

export default function StudioPage() {
  const pathname = usePathname()
  const workspaces = Array.isArray(config) ? config : [config]
  const currentWorkspace = (workspaces.find(workspace =>
    pathname?.includes(workspace.basePath)
  ) || workspaces[0]) as WorkspaceConfig

  useEffect(() => {
    // Clear any stale dataset from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sanityDataset')
    }
  }, [])

  // Log environment info for debugging
  console.log('Studio Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    workspace: currentWorkspace.name,
    dataset: currentWorkspace.dataset,
    pathname
  })

  return (
    <NextStudio
      config={currentWorkspace}
      unstable_noAuthBoundary
    />
  )
}
