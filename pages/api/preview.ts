import { NextApiRequest, NextApiResponse } from 'next'

export default async function preview(req: NextApiRequest, res: NextApiResponse) {
  const { secret, id, type } = req.query
  const decodedSecret = decodeURIComponent(secret as string)

  console.log('Preview request:', {
    secret: decodedSecret,
    hasPreviewSecret: !!process.env.SANITY_PREVIEW_SECRET,
    hasPublicPreviewSecret: !!process.env.NEXT_PUBLIC_PREVIEW_SECRET,
    hasStudioPreviewSecret: !!process.env.SANITY_STUDIO_PREVIEW_SECRET,
    secretsMatch: {
      preview: decodedSecret === process.env.SANITY_PREVIEW_SECRET,
      public: decodedSecret === process.env.NEXT_PUBLIC_PREVIEW_SECRET,
      studio: decodedSecret === process.env.SANITY_STUDIO_PREVIEW_SECRET,
    },
    secretLengths: {
      preview: process.env.SANITY_PREVIEW_SECRET?.length,
      public: process.env.NEXT_PUBLIC_PREVIEW_SECRET?.length,
      studio: process.env.SANITY_STUDIO_PREVIEW_SECRET?.length,
    }
  })

  // Check if the preview secret matches
  if (decodedSecret !== process.env.SANITY_PREVIEW_SECRET &&
      decodedSecret !== process.env.NEXT_PUBLIC_PREVIEW_SECRET &&
      decodedSecret !== process.env.SANITY_STUDIO_PREVIEW_SECRET) {
    return res.status(401).json({ message: 'Invalid secret' })
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
