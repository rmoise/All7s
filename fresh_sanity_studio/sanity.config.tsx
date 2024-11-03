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

// Define singleton actions and types
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['home', 'settings'])

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'

// Define base plugins
const basePlugins = [
  deskTool({
    structure,
    defaultDocumentNode
  }),
  colorInput(),
  imageHotspotArrayPlugin(),
  media(),
]

const baseConfig = {
  projectId,
  schema: {
    types: schemaTypes as SchemaTypeDefinition[],
    // Filter out singleton types from "New document" menu
    templates: (templates: any) =>
      templates.filter(({ schemaType }: { schemaType: string }) =>
        !singletonTypes.has(schemaType)
      ),
  },
  document: {
    // Filter actions for singleton types
    actions: (input: any, context: any) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }: { action: string }) =>
            action && singletonActions.has(action)
          )
        : input,
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

// Create production plugins based on environment
const productionPlugins = [...basePlugins]
if (process.env.NODE_ENV === 'development') {
  productionPlugins.push(visionTool())
}

export default defineConfig([
  {
    ...baseConfig,
    name: 'production',
    title: 'Production',
    basePath: '/production',
    dataset: 'production',
    icon: RocketIcon,
    plugins: productionPlugins
  },
  {
    ...baseConfig,
    name: 'staging',
    title: 'Staging',
    basePath: '/staging',
    dataset: 'staging',
    icon: RobotIcon,
    plugins: [
      ...basePlugins,
      visionTool()
    ]
  }
])
