// sanity.config.tsx

import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {colorInput} from '@sanity/color-input'
import deskStructure from './deskStructure'
import {CustomStudioLayout} from './CustomStudioLayout'
import schemaTypes from './schemas/schema'

const getDefaultDataset = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sanityDataset') || 'staging'
  }
  return process.env.SANITY_STUDIO_DATASET || 'staging'
}

const getNetlifyUrl = (): string => {
  if (process.env.SANITY_STUDIO_NETLIFY_URL) {
    return process.env.SANITY_STUDIO_NETLIFY_URL
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  if (hostname === 'localhost') {
    return 'http://localhost:8888'
  } else if (hostname === 'staging--all7z.netlify.app') {
    return 'https://staging--all7z.netlify.app'
  } else if (hostname === 'all7z.com') {
    return 'https://all7z.com'
  } else {
    // Default to production URL
    return 'https://all7z.com'
  }
}

const devOnlyPlugins = [visionTool()]

export default defineConfig({
  name: 'default',
  title: 'stak_site',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
  dataset: getDefaultDataset(),
  plugins: [
    deskTool({
      structure: deskStructure,
    }),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
    ...(process.env.NODE_ENV !== 'production' ? devOnlyPlugins : []),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev) => [...prev], // Removed FetchMetadataAction from actions
  },
  form: {
    file: {
      assetSources: (previousAssetSources) => previousAssetSources,
    },
    image: {
      assetSources: (previousAssetSources) =>
        previousAssetSources.filter(
          (assetSource) =>
            assetSource.name === 'media-library' || assetSource.name === 'sanity-default',
        ),
    },
  },
  studio: {
    components: {
      layout: CustomStudioLayout,
    },
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
    dataset: getDefaultDataset(),
    cors: {
      allowOrigins: [
        'http://localhost:3333',
        'http://localhost:8888',
        'https://staging--all7z.netlify.app',
        'https://all7z.com',
      ],
    },
  },
  env: {
    NETLIFY_FUNCTION_URL:
      process.env.SANITY_STUDIO_NETLIFY_FUNCTION_URL || `${getNetlifyUrl()}/.netlify/functions`,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  },
})
