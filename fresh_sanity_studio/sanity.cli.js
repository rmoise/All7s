const { defineCliConfig } = require('sanity/cli')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '../.env' })

const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

module.exports = defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
    dataset,
    token: process.env.SANITY_STUDIO_API_TOKEN
  },
  studioHost: 'all7z'
}) 