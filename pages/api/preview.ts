import { NextApiRequest, NextApiResponse } from 'next'

export default async function preview(req: NextApiRequest, res: NextApiResponse) {
  const { secret, id, type } = req.query

  if (!secret) {
    console.error('No secret provided in preview request');
    return res.status(401).json({ message: 'No secret provided' });
  }

  // Decode the secret from the URL
  const decodedSecret = decodeURIComponent(secret as string)

  // Get the configured preview secret
  const configuredSecret = process.env.SANITY_PREVIEW_SECRET

  console.log('Preview Request Details:', {
    environment: process.env.NODE_ENV,
    host: req.headers.host,
    secretProvided: !!decodedSecret,
    secretLength: decodedSecret?.length,
    configuredSecretLength: configuredSecret?.length,
    secretsMatch: decodedSecret === configuredSecret
  })

  console.log('Configured Secret:', configuredSecret);

  if (!configuredSecret) {
    console.error('No preview secret configured in environment');
    return res.status(500).json({ message: 'Preview not configured' });
  }

  if (decodedSecret !== configuredSecret) {
    console.error('Invalid preview secret provided');
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
