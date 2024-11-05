import {createClient} from '@sanity/client'
import {sanityConfig} from '../../lib/config'

const client = createClient({
  ...sanityConfig,
  token: process.env.SANITY_STUDIO_API_TOKEN,
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
