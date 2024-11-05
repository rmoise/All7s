import type { NextApiRequest, NextApiResponse } from 'next'
import { previewClient } from '../../lib/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for secret to confirm this is a valid request
  if (req.query.secret !== process.env.SANITY_PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const { type, id } = req.query

  if (!type || !id) {
    return res.status(400).json({ message: 'Missing type or id parameter' })
  }

  try {
    // Check if the document exists
    const document = await previewClient.fetch(
      `*[_type == $type && _id == $id][0]`,
      { type, id }
    )

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Enable Preview Mode by setting the cookies
    res.setPreviewData({ id })

    // Redirect to the path from the fetched document
    const path = type === 'home' ? '/' : `/${type}/${document.slug?.current || ''}`
    res.writeHead(307, { Location: path })
    res.end()
  } catch (err) {
    console.error('Preview Error:', err)
    return res.status(500).json({ message: 'Error checking preview' })
  }
}