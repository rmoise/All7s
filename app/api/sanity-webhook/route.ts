import { revalidateTag } from 'next/cache'
import { type NextRequest } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'

// Get the webhook secret from environment variables
const SANITY_WEBHOOK_SECRET =
  process.env.SANITY_WEBHOOK_SECRET || process.env.SANITY_STUDIO_WEBHOOK_SECRET

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
    // Log request headers for debugging
    console.log(
      'Webhook request headers:',
      Object.fromEntries(req.headers.entries())
    )

    const body = await req.json()
    console.log('Webhook request body:', body)

    const signature =
      req.headers.get(SIGNATURE_HEADER_NAME) ||
      req.headers.get('x-sanity-signature')

    if (!SANITY_WEBHOOK_SECRET) {
      console.error(
        'Missing webhook secret. Please set SANITY_WEBHOOK_SECRET or SANITY_STUDIO_WEBHOOK_SECRET'
      )
      return Response.json(
        {
          message: 'Missing webhook secret',
          error: 'Configuration error',
          env: process.env.NODE_ENV,
          hasSecret: false,
        },
        { status: 401 }
      )
    }

    if (!signature) {
      console.error('Missing signature header')
      return Response.json(
        {
          message: 'Missing signature',
          headers: Object.fromEntries(req.headers.entries()),
        },
        { status: 401 }
      )
    }

    const rawBody = JSON.stringify(body)
    const isValid = isValidSignature(rawBody, signature, SANITY_WEBHOOK_SECRET)

    if (!isValid) {
      console.error('Invalid signature', {
        signature,
        bodyLength: rawBody.length,
        secretLength: SANITY_WEBHOOK_SECRET.length,
      })
      return Response.json({ message: 'Invalid signature' }, { status: 401 })
    }

    const { _type, _id } = body

    if (!_type || !_id) {
      console.error('Missing document type or ID', body)
      return Response.json(
        { message: 'Missing document type or ID' },
        { status: 400 }
      )
    }

    console.log(`Revalidating cache for ${_type} (${_id})`)

    // Get cache tags for the document type
    const cacheTags = [...(CACHE_TAGS[_type as keyof typeof CACHE_TAGS] || [])]

    // Always include the specific document type as a tag
    cacheTags.push(_type)

    // Add global tag for certain types
    if (['settings', 'home'].includes(_type)) {
      cacheTags.push('global')
    }

    // Revalidate all relevant cache tags
    const revalidationResults = await Promise.allSettled(
      cacheTags.map(async (tag) => {
        try {
          await revalidateTag(tag)
          console.log(`Successfully revalidated cache tag: ${tag}`)
          return { tag, success: true }
        } catch (error) {
          console.error(`Error revalidating tag ${tag}:`, error)
          return {
            tag,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      })
    )

    const results = revalidationResults.map((result, index) => ({
      status: result.status,
      ...(result.status === 'fulfilled'
        ? result.value
        : { error: result.reason }),
    }))

    return Response.json({
      message: `Processed ${cacheTags.length} cache tags for ${_type}`,
      document: { _type, _id },
      revalidated: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json(
      {
        message: 'Error revalidating',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json(
    {
      message:
        'Sanity webhook endpoint is active. Please use POST method for webhooks.',
      timestamp: new Date().toISOString(),
    },
    { status: 405 }
  )
}
