import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { setPreviewToken } from '@/lib/preview'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== process.env.SANITY_PREVIEW_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    const token = process.env.SANITY_API_READ_TOKEN
    if (!token) {
      throw new Error('Missing preview token')
    }

    await setPreviewToken(token)

    const redirectUrl = new URL('/', request.url)
    redirectUrl.searchParams.set('preview', '1')

    return NextResponse.redirect(redirectUrl, {
      status: 307,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Preview Error:', error)
    return NextResponse.json({ message: 'Error enabling preview' }, { status: 500 })
  }
}