import { draftMode } from 'next/headers'
import { cookies, headers } from 'next/headers'

export async function setPreviewToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('sanity-preview-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600 // 1 hour expiration
  })
}

export async function getPreviewToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sanity-preview-token')?.value ?? null
  const headersList = await headers()
  const referrer = headersList.get('referer') || ''
  const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || ''

  // Always allow preview in development
  if (process.env.NODE_ENV === 'development') {
    return token
  }

  // Validate studio URL is configured
  if (!studioUrl) {
    console.warn('NEXT_PUBLIC_SANITY_STUDIO_URL is not configured')
    return null
  }

  // Allow preview if coming from Sanity Studio or if already in preview mode
  const draft = await draftMode()
  const isEnabled = await draft.isEnabled

  if (referrer.startsWith(studioUrl) || isEnabled) {
    return token
  }

  return null
}

export async function enablePreview() {
  const draft = await draftMode()
  await draft.enable()

  // Clear any existing preview data from the response
  const headers = new Headers()
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  headers.set('Pragma', 'no-cache')
  headers.set('Expires', '0')

  return new Response(null, {
    status: 307,
    headers
  })
}

export async function disablePreview() {
  const draft = await draftMode()
  await draft.disable()
}
