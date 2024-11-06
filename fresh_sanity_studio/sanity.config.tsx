import { defineConfig, WorkspaceOptions } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { media } from 'sanity-plugin-media'
import { imageHotspotArrayPlugin } from 'sanity-plugin-hotspot-array'
import { colorInput } from '@sanity/color-input'
import { RobotIcon, RocketIcon } from '@sanity/icons'
import { defaultDocumentNode } from './plugins/defaultDocumentNode'
import { structure } from './deskStructure'
import schemaTypes from './schemas/schema'
import type { SchemaTypeDefinition } from 'sanity'

// Define types for context and prev
interface DocumentContext {
  document: {
    _type: string;
    _id: string;
  }
}

interface WorkspaceConfig extends Omit<WorkspaceOptions, 'name' | 'title' | 'dataset' | 'icon'> {
  name: string;
  title: string;
  dataset: string;
  icon?: any;
  schema: {
    types: SchemaTypeDefinition[];
    templates?: (templates: any[]) => any[];
  };
  document?: {
    actions?: (input: any[], context: any) => any[];
    newDocumentOptions?: any;
    productionUrl?: (prev: string | undefined, context: DocumentContext) => Promise<string | undefined>;
  };
  form?: {
    file?: {
      assetSources?: (prev: any[]) => any[];
    };
    image?: {
      assetSources?: (prev: any[]) => any[];
    };
  };
}

// Define singleton actions and types
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
const singletonTypes = new Set(['home', 'settings'])

// Ensure projectId and dataset are always defined
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x'

const getCurrentDataset = () => {
  if (typeof window !== 'undefined') {
    return window.location.pathname.includes('/staging') ? 'staging' : 'production';
  }
  return process.env.SANITY_STUDIO_DATASET || 'production';
};

console.log('Sanity Config:', {
  env: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NODE_ENV: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
  dataset: getCurrentDataset(),
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

// Define workspaces with specific configurations
const workspaces: WorkspaceConfig[] = [
  {
    name: 'production',
    title: 'Production',
    basePath: '/production',
    icon: RocketIcon,
    projectId,
    dataset: 'production',
    plugins,
    schema: schemaConfig,
    document: {
      productionUrl: async (prev: string | undefined, context: DocumentContext) => {
        const { document } = context
        const baseUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3000'
          : window.location.pathname.includes('/staging')
            ? 'https://staging--all7z.netlify.app'
            : process.env.SANITY_STUDIO_PREVIEW_URL || 'https://all7z.com'

        if (document._type === 'home') {
          const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET ||
                        process.env.NEXT_PUBLIC_PREVIEW_SECRET
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
      productionUrl: async (prev: string | undefined, context: DocumentContext) => {
        const { document } = context
        const baseUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3000'
          : 'https://staging--all7z.netlify.app'

        if (document._type === 'home') {
          const secret = process.env.SANITY_STUDIO_PREVIEW_SECRET ||
                        process.env.NEXT_PUBLIC_PREVIEW_SECRET
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
    }
  }
]

// Export the configuration
export default defineConfig(workspaces)
