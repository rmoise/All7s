import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {RobotIcon, RocketIcon} from '@sanity/icons'
import {defaultDocumentNode} from './plugins/defaultDocumentNode'
import {structure} from './deskStructure'
import schemaTypes from './schemas/schema'
import type {SchemaTypeDefinition, ConfigContext} from 'sanity'
import dotenv from 'dotenv'
import {colorInput} from '@sanity/color-input'

// Load environment variables at the start
if (typeof window === 'undefined') {
  dotenv.config({ path: '../.env' });
  dotenv.config({ path: '../.env.local' });
  dotenv.config({ path: '../.env.development' });
  dotenv.config({ path: '../.env.development.local' });
}

// Initialize token first
const token = process.env.SANITY_AUTH_TOKEN ||
              process.env.SANITY_STUDIO_API_TOKEN ||
              process.env.NEXT_PUBLIC_SANITY_TOKEN;

console.log('Auth Token Status:', {
  hasToken: !!token,
  tokenLength: token?.length,
  source: token === process.env.SANITY_AUTH_TOKEN ? 'AUTH_TOKEN' :
          token === process.env.SANITY_STUDIO_API_TOKEN ? 'STUDIO_API_TOKEN' :
          token === process.env.NEXT_PUBLIC_SANITY_TOKEN ? 'PUBLIC_TOKEN' : 'NONE'
});

// Define singleton actions and types
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['home', 'settings', 'shopPage'])

// Ensure projectId and dataset are always defined
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'

const getCurrentDataset = () => {
  const envDataset = process.env.SANITY_STUDIO_DATASET
  const pathDataset = typeof window !== 'undefined' && window.location.pathname.includes('/staging') ? 'staging' : 'production'

  console.log('Dataset Resolution:', {
    envDataset,
    pathDataset,
    final: envDataset || pathDataset
  })

  return envDataset || pathDataset
}

console.log('Sanity Config Environment:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  dataset: getCurrentDataset(),
  workspace: typeof window !== 'undefined' ? window.location.pathname : 'server',
  hasReadToken: !!process.env.SANITY_API_READ_TOKEN,
  hasAuthToken: !!process.env.SANITY_AUTH_TOKEN,
  projectId
})

console.log('SANITY_AUTH_TOKEN:', process.env.SANITY_AUTH_TOKEN ? 'Present' : 'Missing')

// Define schema configuration
const schemaConfig = {
  types: schemaTypes as SchemaTypeDefinition[],
  templates: (templates: any[]) =>
    templates.filter(({schemaType}: {schemaType: string}) => !singletonTypes.has(schemaType)),
}

// Define plugins configuration
const plugins = [
  deskTool({
    structure,
    defaultDocumentNode,
  }),
  media(),
  visionTool(),
  imageHotspotArrayPlugin(),
  colorInput()
]

// Export the configuration
export default defineConfig([
  {
    name: 'production',
    title: 'Production',
    basePath: '/production',
    icon: RocketIcon,
    projectId,
    dataset: 'production',
    plugins,
    schema: schemaConfig,
    apiVersion: '2024-03-19',
    document: {
      productionUrl: async (prev: string | undefined, context: any) => {
        const {document} = context
        const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET

        if (!previewSecret) {
          return prev
        }

        const secret = encodeURIComponent(previewSecret)
        const baseUrl =
          window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://all7z.com'

        return `${baseUrl}/api/preview?secret=${secret}&type=${document._type}&id=${document._id}`
      },
      actions: (input: any[], context: any) =>
        singletonTypes.has(context.schemaType)
          ? input.filter(({action}: {action: string}) => action && singletonActions.has(action))
          : input,
    }
  },
  {
    name: 'staging',
    title: 'Staging',
    basePath: '/staging',
    icon: RobotIcon,
    projectId,
    dataset: 'staging',
    plugins,
    schema: schemaConfig,
    document: {
      productionUrl: async (prev: string | undefined, context: any) => {
        const {document} = context
        const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET

        if (!previewSecret) {
          return prev
        }

        const secret = encodeURIComponent(previewSecret)
        const baseUrl =
          window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://staging--all7z.netlify.app'

        return `${baseUrl}/api/preview?secret=${secret}&type=${document._type}&id=${document._id}`
      },
      actions: (input: any[], context: any) =>
        singletonTypes.has(context.schemaType)
          ? input.filter(({action}: {action: string}) => action && singletonActions.has(action))
          : input,
    }
  }
])

