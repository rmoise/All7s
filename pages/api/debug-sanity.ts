import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@sanity/client'
import { sanityConfig } from '@/lib/config'

const client = createClient(sanityConfig)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Log the complete environment configuration
    const config = {
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      environment: process.env.NODE_ENV,
      apiVersion: '2024-03-19',
      token: process.env.SANITY_TOKEN
        ? 'SANITY_TOKEN Present'
        : process.env.SANITY_API_READ_TOKEN
          ? 'SANITY_API_READ_TOKEN Present'
          : 'Missing',
      studioToken: process.env.SANITY_STUDIO_API_TOKEN ? 'Present' : 'Missing',
    }

    console.log('Debug API Config:', config)

    // Test both document IDs
    const [settingsSingleton, settingsRegular, home, homeSingleton] =
      await Promise.all([
        client.fetch(
          '*[_type == "settings" && _id == "singleton-settings"][0]'
        ),
        client.fetch('*[_type == "settings" && _id == "settings"][0]'),
        client.fetch('*[_type == "home"][0]'),
        client.fetch('*[_type == "home" && _id == "singleton-home"][0]'),
      ])

    res.status(200).json({
      config,
      documents: {
        settingsSingleton,
        settingsRegular,
        home,
        homeSingleton,
      },
      environment: process.env.NODE_ENV,
      clientConfig: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: '2024-03-19',
        environment: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error('Debug route error:', error)
    res.status(500).json({
      error: 'Failed to fetch data',
      details:
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              stack:
                process.env.NODE_ENV === 'development'
                  ? error.stack
                  : undefined,
            }
          : error,
      config: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        environment: process.env.NODE_ENV,
        tokenPresent:
          !!process.env.SANITY_TOKEN || !!process.env.SANITY_API_READ_TOKEN,
      },
    })
  }
}
