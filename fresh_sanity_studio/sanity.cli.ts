import { defineCliConfig } from 'sanity/cli'
import { PROJECT_ID } from './sanity.config'

export default defineCliConfig({
  api: {
    projectId: PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'all7z'
})
