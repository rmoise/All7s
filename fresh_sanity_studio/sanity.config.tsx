import React from 'react'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { imageHotspotArrayPlugin } from 'sanity-plugin-hotspot-array'
import { colorInput } from '@sanity/color-input'
import { structure } from './deskStructure'
import { defaultDocumentNode } from './plugins/defaultDocumentNode'
import schemaTypes from './schemas/schema'
import DatasetSwitcher from './src/components/DatasetSwitcher'
import { StudioProvider } from './src/components/StudioProvider'

const isBrowser = typeof window !== 'undefined'

const getDefaultDataset = (): string => {
  return isBrowser
    ? localStorage.getItem('sanityDataset') || 'staging'
    : process.env.SANITY_STUDIO_DATASET || 'staging'
}

export const getNetlifyUrl = (): string => {
  if (process.env.SANITY_STUDIO_NETLIFY_URL)
    return process.env.SANITY_STUDIO_NETLIFY_URL
  if (!isBrowser) return 'https://all7z.com' // Default to production for server-side
  const hostMap: Record<string, string> = {
    localhost: 'http://localhost:8888',
    'staging--all7z.netlify.app': 'https://staging--all7z.netlify.app',
    'all7z.com': 'https://all7z.com',
  }
  return hostMap[window.location.hostname] || 'https://all7z.com'
}

const devOnlyPlugins = [visionTool()]

// Define selection type
interface PreviewSelection {
  title?: string
  slug?: { current?: string }
}

export default defineConfig({
  name: 'default',
  title: 'stak_site',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
  dataset: getDefaultDataset(),
  plugins: [
    deskTool({
      structure,
      defaultDocumentNode,
    }),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
    ...(process.env.NODE_ENV !== 'production' ? devOnlyPlugins : []),
  ],
  schema: {
    types: schemaTypes as any,
  },
  document: {
    actions: (prev) => [...prev],
  },
  form: {
    file: { assetSources: (previousAssetSources) => previousAssetSources },
    image: {
      assetSources: (previousAssetSources) =>
        previousAssetSources.filter(
          (assetSource) =>
            assetSource.name === 'media-library' ||
            assetSource.name === 'sanity-default'
        ),
    },
  },
  studio: {
    components: {
      layout: (props) => (
        <StudioProvider>
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              borderBottom: '1px solid var(--card-border-color)',
              backgroundColor: 'white',
            }}>
              <DatasetSwitcher />
            </div>
            <div style={{ flexGrow: 1, overflow: 'auto' }}>
              {props.renderDefault(props)}
            </div>
          </div>
        </StudioProvider>
      ),
    },
  },
  env: {
    NETLIFY_FUNCTION_URL:
      process.env.SANITY_STUDIO_NETLIFY_FUNCTION_URL ||
      `${getNetlifyUrl()}/.netlify/functions`,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  },
})
