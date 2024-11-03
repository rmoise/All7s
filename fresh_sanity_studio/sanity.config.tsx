import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { imageHotspotArrayPlugin } from 'sanity-plugin-hotspot-array'
import { colorInput } from '@sanity/color-input'
import { RobotIcon, RocketIcon } from '@sanity/icons'
import { defaultDocumentNode } from './plugins/defaultDocumentNode'
import { structure } from './deskStructure'
import schemaTypes from './schemas/schema'
import type { AssetSource, SchemaTypeDefinition } from '@sanity/types'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'

const baseConfig = {
  projectId,
  plugins: [
    deskTool({
      structure,
      defaultDocumentNode
    }),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
  ],
  schema: {
    types: schemaTypes as SchemaTypeDefinition[],
  },
  form: {
    file: {
      assetSources: (prev: AssetSource[]) => prev.filter(source => source.name === 'sanity-default')
    },
    image: {
      assetSources: (prev: AssetSource[]) => prev.filter(source =>
        source.name === 'media-library' || source.name === 'sanity-default'
      )
    }
  }
}

export default defineConfig([
  {
    ...baseConfig,
    name: 'production',
    title: 'Production',
    basePath: '/production',
    dataset: 'production',
    icon: RocketIcon,
    plugins: [
      ...baseConfig.plugins,
      process.env.NODE_ENV === 'development' && visionTool()
    ].filter(Boolean)
  },
  {
    ...baseConfig,
    name: 'staging',
    title: 'Staging',
    basePath: '/staging',
    dataset: 'staging',
    icon: RobotIcon,
    plugins: [
      ...baseConfig.plugins,
      visionTool()
    ]
  }
])
