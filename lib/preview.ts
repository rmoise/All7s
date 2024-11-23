'use server'

import { cookies } from 'next/headers'

const PREVIEW_TOKEN_NAME = 'sanityPreviewToken'

export async function getPreviewToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PREVIEW_TOKEN_NAME)
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'

  // Only allow preview in staging and production
  if (environment !== 'staging' && environment !== 'production') {
    return null
  }

  return token?.value || process.env.SANITY_PREVIEW_TOKEN || null
}

export async function setPreviewToken(token: string) {
  const cookieStore = await cookies()
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'

  // Only set preview token in staging and production
  if (environment === 'staging' || environment === 'production') {
    cookieStore.set(PREVIEW_TOKEN_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })
  }
}

export async function removePreviewToken() {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIEW_TOKEN_NAME)
}

export async function isPreviewMode(): Promise<boolean> {
  const token = await getPreviewToken()
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'production'
  return !!(token && (environment === 'staging' || environment === 'production'))
}