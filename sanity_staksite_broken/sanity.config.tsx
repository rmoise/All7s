import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {colorInput} from '@sanity/color-input'
import deskStructure from './deskStructure'
import {CustomStudioLayout} from './CustomStudioLayout'
import schemaTypes from './schemas/schema'

interface AssetSource {
  name: string
  title: string
  component: React.ComponentType<any>
  icon?: React.ComponentType
}

interface DocumentActions {
  name: string
  title: string
  action: (props: any) => void
}

const isBrowser = typeof window !== 'undefined'

const getDefaultDataset = (): string => {
  return isBrowser
    ? localStorage.getItem('sanityDataset') || 'staging'
    : process.env.SANITY_STUDIO_DATASET || 'staging'
}

const getNetlifyUrl = (): string => {
  if (process.env.SANITY_STUDIO_NETLIFY_URL) return process.env.SANITY_STUDIO_NETLIFY_URL
  if (!isBrowser) return 'https://all7z.com' // Default to production for server-side
  const hostMap: Record<string, string> = {
    localhost: 'http://localhost:8888',
    'staging--all7z.netlify.app': 'https://staging--all7z.netlify.app',
    'all7z.com': 'https://all7z.com',
  }
  return hostMap[window.location.hostname] || 'https://all7z.com'
}

const devOnlyPlugins = [visionTool()]

export default defineConfig({
  name: 'default',
  title: 'stak_site',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
  dataset: getDefaultDataset(),
  plugins: [
    deskTool({structure: deskStructure}),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
    ...(process.env.NODE_ENV !== 'production' ? devOnlyPlugins : []),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev: DocumentActions[]) => [...prev],
  },
  form: {
    file: {
      assetSources: (previousAssetSources: AssetSource[]) => previousAssetSources
    },
    image: {
      assetSources: (previousAssetSources: AssetSource[]) =>
        previousAssetSources.filter(
          (assetSource: AssetSource) =>
            assetSource.name === 'media-library' || assetSource.name === 'sanity-default',
        ),
    },
  },
  studio: {
    components: {
      layout: CustomStudioLayout,
    },
  },
  env: {
    NETLIFY_FUNCTION_URL:
      process.env.SANITY_STUDIO_NETLIFY_FUNCTION_URL || `${getNetlifyUrl()}/.netlify/functions`,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  },
})
