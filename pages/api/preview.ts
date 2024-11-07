import { NextApiRequest, NextApiResponse } from 'next'

export default async function preview(req: NextApiRequest, res: NextApiResponse) {
  const { secret, id, type } = req.query

  if (!secret) {
    console.error('No secret provided in preview request');
    return res.status(401).json({ message: 'No secret provided' });
  }

  const decodedSecret = decodeURIComponent(secret as string)

  console.log('Preview Request Details:', {
    environment: process.env.NODE_ENV,
    host: req.headers.host,
    secretProvided: !!decodedSecret,
    secretLength: decodedSecret?.length,
    envSecrets: {
      hasPreviewSecret: !!process.env.SANITY_PREVIEW_SECRET,
      hasPublicSecret: !!process.env.NEXT_PUBLIC_PREVIEW_SECRET,
      hasStudioSecret: !!process.env.SANITY_STUDIO_PREVIEW_SECRET,
      previewSecretLength: process.env.SANITY_PREVIEW_SECRET?.length
    }
  })

  if (!process.env.SANITY_PREVIEW_SECRET &&
      !process.env.NEXT_PUBLIC_PREVIEW_SECRET &&
      !process.env.SANITY_STUDIO_PREVIEW_SECRET) {
    console.error('No preview secrets configured in environment');
    return res.status(500).json({ message: 'Preview not configured' });
  }

  const isValidSecret = [
    process.env.SANITY_PREVIEW_SECRET,
    process.env.NEXT_PUBLIC_PREVIEW_SECRET,
    process.env.SANITY_STUDIO_PREVIEW_SECRET
  ].some(envSecret => envSecret && decodedSecret === envSecret);

  if (!isValidSecret) {
    return res.status(401).json({ message: 'Invalid secret' });
  }

  if (!id || !type) {
    return res.status(400).json({ message: 'Missing id or type' })
  }

  // Enable Preview Mode by setting preview data
  res.setPreviewData({
    id: Array.isArray(id) ? id[0] : id,
    type: Array.isArray(type) ? type[0] : type,
  })

  // Redirect to the path from the fetched post
  const redirectUrl = type === 'home' ? '/' : `/${type}/${id}`
  res.writeHead(307, { Location: redirectUrl })
  res.end()
}
