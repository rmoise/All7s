'use server'

import { cookies } from 'next/headers'
import { sanityConfig } from './config'

const PREVIEW_TOKEN_NAME = 'sanityPreviewToken'

export async function getPreviewToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(PREVIEW_TOKEN_NAME)
  const fallbackToken = process.env.SANITY_API_READ_TOKEN

  // Debug logging
  console.log('Preview Token Status:', {
    hasCookieToken: !!token?.value,
    hasFallbackToken: !!fallbackToken,
    isServer: typeof window === 'undefined'
  })

  return token?.value || fallbackToken || null
}

export async function setPreviewToken(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(PREVIEW_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  })
}

export async function removePreviewToken() {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIEW_TOKEN_NAME)
}

export async function isPreviewMode(): Promise<boolean> {
  const token = await getPreviewToken()
  return !!token
}