// pages/api/preview.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { previewClient } from '../../lib/client'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, id } = req.query

  if (!secret) {
    return res.status(401).json({ message: 'No secret token provided' })
  }

  // Check the secret
  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    console.error('Invalid preview secret provided')
    console.log('Preview Request Details:', {
      environment: process.env.NODE_ENV,
      host: req.headers.host,
      secretProvided: !!secret,
      secretLength: secret?.length,
      configuredSecretLength: process.env.SANITY_PREVIEW_SECRET?.length,
      secretsMatch: secret === process.env.SANITY_PREVIEW_SECRET
    })
    return res.status(401).json({ message: 'Invalid secret token' })
  }

  // Enable Preview Mode by setting the cookies
  res.setPreviewData({ id })

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  res.writeHead(307, { Location: '/' })
  res.end()
}
