import { defineConfig, SanityConfig, SchemaTypeDefinition } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { imageHotspotArrayPlugin } from 'sanity-plugin-hotspot-array'
import { colorInput } from '@sanity/color-input'
import { RobotIcon, RocketIcon } from '@sanity/icons'
import { defaultDocumentNode } from './plugins/defaultDocumentNode'
import { structure } from './deskStructure'
import schemaTypes from './schemas/schema'

// Define types for context and prev
interface DocumentContext {
  document: {
    _type: string;
    _id: string;
  }
}

interface WorkspaceConfig extends Omit<SanityConfig, 'schema'> {
  schema: {
    types: SchemaTypeDefinition[];
    templates?: (templates: any[]) => any[];
  };
  document?: {
    actions?: (input: any[], context: any) => any[];
    newDocumentOptions?: any;
    productionUrl?: (prev: string | undefined, context: DocumentContext) => Promise<string | undefined>;
  };
}

// Define singleton actions and types
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['home', 'settings'])

// Ensure projectId and dataset are always defined
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'

const getDataset = () => {
  // Check window location first for production
  if (typeof window !== 'undefined' && window.location.hostname === 'all7z.sanity.studio') {
    return 'production';
  }

  // Then check environment variables
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return 'production';
  }

  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging' || process.env.SANITY_STUDIO_DATASET === 'staging') {
    return 'staging';
  }

  return process.env.SANITY_STUDIO_DATASET || 'production';
};

const dataset = getDataset();

console.log('Sanity Config:', {
  env: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NODE_ENV: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  dataset,
  projectId
})

// Define schema configuration
const schemaConfig: WorkspaceConfig['schema'] = {
  types: schemaTypes as SchemaTypeDefinition[],
  templates: (templates: any[]) =>
    templates.filter(({ schemaType }: { schemaType: string }) =>
      !singletonTypes.has(schemaType)
    ),
}

// Define plugins configuration
const plugins = [
  deskTool({
    structure,
    defaultDocumentNode
  }),
  media(),
  visionTool(),
  imageHotspotArrayPlugin(),
  colorInput()
]

// Define base configuration
const baseConfig: Omit<WorkspaceConfig, 'name' | 'title' | 'dataset' | 'icon'> = {
  projectId,
  basePath: '/studio',
  plugins,
  schema: schemaConfig,
  document: {
    productionUrl: async (prev: string | undefined, context: DocumentContext) => {
      const { document } = context
      const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : process.env.SANITY_STUDIO_PREVIEW_URL || 'https://all7z.com'

      if (document._type === 'home') {
        const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET
        return `${baseUrl}/api/preview?secret=${secret}&type=${document._type}&id=${document._id}`
      }

      return prev
    },
    actions: (input: any[], context: any) =>
      singletonTypes.has(context.schemaType)
        ? input.filter(({ action }: { action: string }) =>
            action && singletonActions.has(action)
          )
        : input,
  },
  form: {
    file: {
      assetSources: (prev: any[]) => prev.filter(source => source.name === 'sanity-default')
    },
    image: {
      assetSources: (prev: any[]) => prev.filter(source =>
        source.name === 'media-library' || source.name === 'sanity-default'
      )
    }
  } as const
}

// Create workspace configurations
const workspaces: WorkspaceConfig[] = [
  {
    ...baseConfig,
    name: 'production',
    title: 'Production',
    basePath: '/production',
    dataset: 'production',
    icon: RocketIcon,
  },
  {
    ...baseConfig,
    name: 'staging',
    title: 'Staging',
    basePath: '/staging',
    dataset: 'staging',
    icon: RobotIcon,
  }
]

export default defineConfig(workspaces as SanityConfig[])
