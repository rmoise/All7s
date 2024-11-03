// @ts-check
const { createClient } = require('@sanity/client')
require('dotenv').config()

const token = process.env.SANITY_STUDIO_API_TOKEN
console.log('Token present:', !!token)
console.log('Token length:', token?.length)

if (!token) {
  throw new Error('SANITY_STUDIO_API_TOKEN is not set in .env')
}

const client = createClient({
  projectId: '1gxdk71x',
  dataset: 'staging',
  token: token,
  useCdn: false,
  apiVersion: '2024-03-13',
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
      contentBlocks: []
    })
    console.log('✓ Created/ensured home singleton')

    console.log('Creating settings document...')
    await client.createIfNotExists({
      _id: 'singleton-settings',
      _type: 'settings',
      title: 'Site Settings',
      seo: {
        metaTitle: 'All7s',
        metaDescription: 'All7s website settings'
      },
      navbar: {
        isTransparent: false,
        navigationLinks: []
      },
      footer: {
        copyrightText: '© 2024 All7s. All rights reserved.',
        alignment: 'center'
      }
    })
    console.log('✓ Created/ensured settings singleton')
  } catch (err) {
    console.error('Error creating documents:', err)
    process.exit(1)
  }
}

createSingletons()