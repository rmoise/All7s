import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {colorInput} from '@sanity/color-input'
import deskStructure from './deskStructure'
import {CustomStudioLayout} from './CustomStudioLayout'
import schemaTypes from './schemas/schema'

// Helper function to get the default dataset
const getDefaultDataset = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sanityDataset') || 'staging'
  }
  return process.env.SANITY_STUDIO_DATASET || 'staging'
}

// Helper function to get the correct Netlify URL based on the environment
const getNetlifyUrl = (): string => {
  if (process.env.SANITY_STUDIO_NETLIFY_URL) {
    return process.env.SANITY_STUDIO_NETLIFY_URL
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://all7z.netlify.app/'
    : 'https://staging--all7z.netlify.app/'
}

const devOnlyPlugins = [visionTool()]

export default defineConfig({
  name: 'default',
  title: 'stak_site',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
  dataset: getDefaultDataset(),
  plugins: [
    deskTool({
      structure: deskStructure
    }),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
    ...(process.env.NODE_ENV !== 'production' ? devOnlyPlugins : []),
  ],
  schema: {
    types: schemaTypes,
  },
  form: {
    file: {
      assetSources: (previousAssetSources) => previousAssetSources,
    },
    image: {
      assetSources: (previousAssetSources) =>
        previousAssetSources.filter(
          (assetSource) =>
            assetSource.name === 'media-library' || assetSource.name === 'sanity-default'
        ),
    },
  },
  studio: {
    components: {
      layout: CustomStudioLayout
    },
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
    dataset: getDefaultDataset(),
    cors: {
      allowOrigins: [
        'http://localhost:8888', // Local Netlify development server
        getNetlifyUrl(),
        'https://all7z.netlify.app/',
        'https://staging--all7z.netlify.app/',
      ],
    },
  },
  env: {
    NETLIFY_FUNCTION_URL: process.env.SANITY_STUDIO_NETLIFY_FUNCTION_URL || `${getNetlifyUrl()}/.netlify/functions`,
  },
})
