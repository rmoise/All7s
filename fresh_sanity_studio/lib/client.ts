import { createClient } from '@sanity/client'
import { studioConfig } from '../../lib/config'

export const studioClient = createClient({
  ...studioConfig,
  dataset: typeof window !== 'undefined' && window.location.pathname.includes('/staging')
    ? 'staging'
    : 'production'
})
