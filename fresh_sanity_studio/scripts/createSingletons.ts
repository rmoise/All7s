import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { environments } from '../sanity.config'

// Load environment variables
dotenv.config()

type Environment = 'production' | 'staging' | 'development'

// Type guard to ensure valid environment
function isValidEnvironment(env: string): env is Environment {
  return ['production', 'staging', 'development'].includes(env)
}

// Determine environment from command line argument or default to production
const rawDataset = process.env.SANITY_STUDIO_DATASET || 'production'
if (!isValidEnvironment(rawDataset)) {
  throw new Error(`Invalid dataset: ${rawDataset}. Must be one of: production, staging, development`)
}

const dataset = rawDataset
console.log('Using dataset:', dataset)

// Get environment configuration
const envConfig = {
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset,
  apiVersion: '2024-03-19',
}

console.log('Token present:', !!process.env.SANITY_AUTH_TOKEN)

if (!process.env.SANITY_AUTH_TOKEN) {
  throw new Error('SANITY_AUTH_TOKEN is not set in .env')
}

const client = createClient({
  ...envConfig,
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

async function testConnection() {
  try {
    await client.fetch('*[_type == "home"][0]')
    console.log('✓ Connection test successful')
  } catch (err) {
    console.error('× Connection test failed:', err)
    process.exit(1)
  }
}

async function createSingletons() {
  console.log('Creating/updating singleton documents...')

  await testConnection()

  try {
    console.log('Creating home document...')
    await client.createIfNotExists({
      _id: 'singleton-home',
      _type: 'home',
      title: 'Home Page',
      metaTitle: 'Welcome to All7s',
      metaDescription: 'Welcome to All7s website',
      contentBlocks: [],
    })
    console.log('✓ Created/ensured home singleton')

    console.log('Creating settings document...')
    await client.createIfNotExists({
      _id: 'singleton-settings',
      _type: 'settings',
      title: 'Site Settings',
      seo: {
        metaTitle: 'All7s',
        metaDescription: 'All7s website settings',
      },
      navbar: {
        isTransparent: false,
        navigationLinks: [],
      },
      footer: {
        copyrightText: '© 2024 All7s. All rights reserved.',
        alignment: 'center',
      },
    })
    console.log('✓ Created/ensured settings singleton')
  } catch (err) {
    console.error('Error creating documents:', err)
    process.exit(1)
  }
}

// Execute if this file is run directly
if (require.main === module) {
  createSingletons()
    .then(() => {
      console.log('✓ All singletons created successfully')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Failed to create singletons:', err)
      process.exit(1)
    })
}

export default createSingletons
