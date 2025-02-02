import { revalidateTag } from 'next/cache'
import { type NextRequest } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET

// Cache tag mapping for different document types
const CACHE_TAGS = {
  album: ['albums', 'music'],
  post: ['posts', 'blog'],
  product: ['products', 'shop'],
  settings: ['settings', 'global'],
  home: ['home', 'global'],
  page: ['pages'],
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const signature = req.headers.get(SIGNATURE_HEADER_NAME) as string

    if (!SANITY_WEBHOOK_SECRET) {
      console.error('Missing SANITY_WEBHOOK_SECRET')
      return Response.json({ message: 'Missing webhook secret' }, { status: 401 })
    }

    if (!signature) {
      console.error('Missing signature header')
      return Response.json({ message: 'Missing signature' }, { status: 401 })
    }

    const rawBody = JSON.stringify(body)
    const isValid = isValidSignature(rawBody, signature, SANITY_WEBHOOK_SECRET)

    if (!isValid) {
      console.error('Invalid signature')
      return Response.json({ message: 'Invalid signature' }, { status: 401 })
    }

    const { _type, _id } = body

    if (!_type || !_id) {
      console.error('Missing document type or ID')
      return Response.json(
        { message: 'Missing document type or ID' },
        { status: 400 }
      )
    }

    console.log(`Revalidating cache for ${_type} (${_id})`)

    // Get cache tags for the document type
    const cacheTags = CACHE_TAGS[_type as keyof typeof CACHE_TAGS] || []

    // Always include the specific document type as a tag
    cacheTags.push(_type)

    // Revalidate all relevant cache tags
    await Promise.all(
      cacheTags.map(async (tag) => {
        try {
          await revalidateTag(tag)
          console.log(`Revalidated cache tag: ${tag}`)
        } catch (error) {
          console.error(`Error revalidating tag ${tag}:`, error)
        }
      })
    )

    return Response.json({
      message: `Revalidated ${cacheTags.length} cache tags for ${_type}`,
      revalidated: true,
      now: Date.now(),
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ message: 'Error revalidating' }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ message: 'Method not allowed' }, { status: 405 })
}