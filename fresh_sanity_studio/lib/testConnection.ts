import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const client = createClient({
  projectId: '1gxdk71x',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-03-19',
  useCdn: false,
  token: process.env.SANITY_STUDIO_API_TOKEN
})

async function testConnection() {
  try {
    const result = await client.fetch('*[_type == "settings"][0]')
    console.log('✓ Sanity connection successful:', result)
    return true
  } catch (error) {
    console.error('× Sanity connection failed:', error)
    return false
  }
}

// Run test
testConnection()