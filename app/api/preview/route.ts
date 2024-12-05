import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getClient } from '@/lib/sanity'
import { setPreviewToken } from '@/lib/preview'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const preview = searchParams.get('preview')

  if (preview !== '1') {
    return new Response('Invalid preview mode', { status: 401 })
  }

  // Set preview token
  await setPreviewToken(process.env.SANITY_API_TOKEN || '')

  // Enable draft mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the homepage
  redirect('/')
}
