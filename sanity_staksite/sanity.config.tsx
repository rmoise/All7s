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
})
