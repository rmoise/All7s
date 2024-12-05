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

  // Validate studio URL is configured
  if (!studioUrl) {
    console.warn('NEXT_PUBLIC_SANITY_STUDIO_URL is not configured')
    return null
  }

  // Only allow preview token if coming from configured Sanity Studio URL
  if (!referrer.startsWith(studioUrl)) {
    return null
  }

  return token
}

export async function enablePreview() {
  const draft = await draftMode()
  await draft.enable()
}

export async function disablePreview() {
  const draft = await draftMode()
  await draft.disable()
}
