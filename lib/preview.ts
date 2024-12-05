import { draftMode } from 'next/headers'
import { cookies } from 'next/headers'

export async function setPreviewToken(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('sanity-preview-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 // 1 hour
  })
}

export async function getPreviewToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('sanity-preview-token')?.value ?? null
}

export async function enablePreview() {
  const draft = await draftMode()
  await draft.enable()
}

export async function disablePreview() {
  const draft = await draftMode()
  await draft.disable()
}