/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

'use client'

import dynamic from 'next/dynamic'
import config from '@/fresh_sanity_studio/sanity.config'

// Dynamically import the Studio component
const StudioComponent = dynamic(() => import('./Studio').then((mod) => mod.Studio), {
  ssr: false,
  loading: () => <div>Loading Studio...</div>,
})

export default function StudioPage() {
  return <StudioComponent />
}
