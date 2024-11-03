import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production'
  },
  studioHost: 'all7z'
})
