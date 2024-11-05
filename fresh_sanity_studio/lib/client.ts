import { createClient } from '@sanity/client'
import { studioConfig } from '../../lib/config'

export const studioClient = createClient(studioConfig)
