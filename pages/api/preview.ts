// pages/api/preview.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { previewClient } from '../../lib/client'

export default async function preview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { secret, id, type = 'home' } = req.query

  if (!secret) {
    return res.status(401).json({ message: 'No secret token provided' })
  }

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    console.error('Preview Configuration:', {
      providedSecret: secret,
      expectedSecret: process.env.SANITY_PREVIEW_SECRET,
      secretLength: secret?.length,
      expectedSecretLength: process.env.SANITY_PREVIEW_SECRET?.length,
      environment: process.env.NODE_ENV
    })
    return res.status(401).json({ message: 'Invalid secret token' })
  }

  try {
    // Verify document exists
    const document = await previewClient.fetch(
      `*[_type == $type && _id == $id][0]`,
      { type, id: id || `drafts.singleton-${type}` }
    )

    if (!document) {
      throw new Error('Document not found')
    }

    // Set preview data with document info
    res.setPreviewData({
      id: document._id,
      type: document._type
    })

    // Redirect to the document path
    const path = type === 'home' ? '/' : `/${type}/${document.slug?.current || ''}`
    res.writeHead(307, { Location: path })
    res.end()
  } catch (error) {
    console.error('Preview Error:', error)
    return res.status(500).json({ message: 'Error enabling preview mode' })
  }
}
