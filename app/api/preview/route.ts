import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getClient } from '@/lib/sanity'
import { setPreviewToken } from '@/lib/preview'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview')
    const secret = searchParams.get('secret')

    console.log('Preview request details:', {
      preview,
      secret,
      hasConfiguredSecret: !!process.env.SANITY_PREVIEW_SECRET,
      hasApiToken: !!process.env.SANITY_API_TOKEN,
      url: request.url,
    })

    // Validate preview secret if configured
    if (
      process.env.SANITY_PREVIEW_SECRET &&
      secret !== process.env.SANITY_PREVIEW_SECRET
    ) {
      console.log('Invalid preview secret')
      return new Response('Invalid preview secret', { status: 401 })
    }

    if (preview !== '1') {
      console.log('Invalid preview mode')
      return new Response('Invalid preview mode', { status: 401 })
    }

    // Enable draft mode
    const draft = await draftMode()
    await draft.enable()

    // Set preview token
    const token = process.env.SANITY_API_TOKEN
    if (token) {
      await setPreviewToken(token)
      console.log('Preview token set successfully')
    } else {
      console.warn('No API token available for preview')
    }

    console.log('Preview mode enabled successfully')

    // Redirect to the homepage with preview mode enabled
    return new Response(null, {
      status: 307,
      headers: {
        Location: '/?preview=1',
      },
    })
  } catch (error) {
    console.error('Preview error:', error)
    return new Response('Preview error', { status: 500 })
  }
}
