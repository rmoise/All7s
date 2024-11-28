import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {RobotIcon, RocketIcon} from '@sanity/icons'
import {defaultDocumentNode} from './plugins/defaultDocumentNode'
import {structure} from './deskStructure'
import schemaTypes from './schemas/schema'
import type {SchemaTypeDefinition} from 'sanity'
import {colorInput} from '@sanity/color-input'
import {getDocumentActions} from './plugins/documentActions'
import dotenv from 'dotenv'
import type {
  DocumentActionsContext,
  DocumentActionComponent,
  WorkspaceOptions,
  DocumentActionsResolver,
  ConfigContext,
} from 'sanity'
import {createClient} from '@sanity/client'
import type {SanityDocument} from '@sanity/types'

// Load environment variables at the start
if (typeof window === 'undefined') {
  dotenv.config({path: '../.env'})
  dotenv.config({path: '../.env.local'})
  dotenv.config({path: '../.env.development'})
  dotenv.config({path: '../.env.development.local'})
}

// Constants
export const SINGLETON_ACTIONS = new Set(['PublishAction', 'DiscardChangesAction', 'RestoreAction'])
export const SINGLETON_TYPES = new Set(['home', 'settings', 'shopPage'])
export const PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'
export const API_VERSION = '2024-03-19'

// Base configuration shared between environments
export const getBaseConfig = () => {
  if (!PROJECT_ID) {
    throw new Error('Project ID is required')
  }

  const config: WorkspaceOptions = {
    projectId: PROJECT_ID,
    name: 'default',
    basePath: '/',
    dataset: 'production',
    plugins: [
      deskTool({
        structure,
        defaultDocumentNode,
      }),
      media(),
      visionTool(),
      imageHotspotArrayPlugin(),
      colorInput(),
    ],
    document: {
      actions: ((input, context) => {
        return getDocumentActions({
          schemaType: context.schemaType,
          actions: input,
        })
      }) satisfies DocumentActionsResolver,
    },
    schema: {
      types: schemaTypes as SchemaTypeDefinition[],
      templates: (templates: any[]) =>
        templates
          .filter(({schemaType}: {schemaType: string}) => !SINGLETON_TYPES.has(schemaType))
          .map((template) => ({
            ...template,
            // Ensure each template has a unique key
            _key: template.schemaType || template.id || crypto.randomUUID(),
          })),
    },
  }

  return config
}

// Environment-specific configurations
export const environments = {
  production: {
    name: 'production',
    title: 'Production',
    dataset: 'production',
    basePath: '/production',
    icon: RocketIcon,
    baseUrl: 'https://all7z.com',
    useCdn: true,
  },
  staging: {
    name: 'staging',
    title: 'Staging',
    dataset: 'staging',
    basePath: '/staging',
    icon: RobotIcon,
    baseUrl: 'https://staging--all7z.netlify.app',
    useCdn: false,
  },
} as const

export type Environment = keyof typeof environments

export const getCurrentEnvironment = (): Environment => {
  if (typeof window === 'undefined') return 'production'
  return window.location.pathname.includes('/staging') ? 'staging' : 'production'
}

export const getSanityConfig = (
  environment: Environment = getCurrentEnvironment(),
): WorkspaceOptions => {
  const envConfig = environments[environment]
  const baseConfig = getBaseConfig()

  return {
    ...baseConfig,
    ...envConfig,
    document: {
      actions: ((input, context) => {
        return getDocumentActions({
          schemaType: context.schemaType,
          actions: input,
        })
      }) satisfies DocumentActionsResolver,
      productionUrl: async (prev: string | undefined, context: any) => {
        const {document} = context
        const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET
        if (!previewSecret) return prev

        const secret = encodeURIComponent(previewSecret)
        const baseUrl =
          window.location.hostname === 'localhost' ? 'http://localhost:3000' : envConfig.baseUrl

        return `${baseUrl}/api/preview?secret=${secret}&type=${document._type}&id=${document._id}`
      },
    },
  }
}

// Export the default config
export default defineConfig([getSanityConfig('production'), getSanityConfig('staging')])

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-03-19',
  useCdn: false,
})

interface ArrayItem {
  _key?: string
  [key: string]: any // For other potential properties
}

interface DocumentWithArray extends SanityDocument {
  arrayField?: ArrayItem[]
}

async function validateArrayKeys() {
  // Query all documents with array fields
  const documents = await client.fetch<DocumentWithArray[]>(`*[_type in ["yourSchemaType"]]`)

  documents.forEach((doc: DocumentWithArray) => {
    if (doc.arrayField && Array.isArray(doc.arrayField)) {
      doc.arrayField.forEach((item: ArrayItem, index: number) => {
        if (!item._key) {
          console.error(`Document ${doc._id} has array item without _key at index ${index}`)
        }
      })
    }
  })
}
validateArrayKeys()
