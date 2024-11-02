// utils/imageUrlBuilder.js

import imageUrlBuilder from '@sanity/image-url'
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  apiVersion: '2024-03-19', // Use current date
  useCdn: false
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
