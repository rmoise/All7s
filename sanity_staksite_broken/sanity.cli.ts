import {defineCliConfig} from 'sanity/cli'

const dataset = process.env.NODE_ENV === 'development' ? 'staging' : 'production'

export default defineCliConfig({
  api: {
    projectId: '1gxdk71x',
    dataset: dataset,
  },
  paths: {
    studio: './sanity_staksite',
  },
})
