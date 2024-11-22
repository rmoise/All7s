import { defineCliConfig } from 'sanity/cli'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
    dataset
  },
  studioHost: 'all7z'
}) 