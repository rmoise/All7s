import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getClient } from '@/lib/sanity'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const preview = searchParams.get('preview')

  if (preview !== '1') {
    return new Response('Invalid preview mode', { status: 401 })
  }

  // Enable draft mode
  const draft = await draftMode()
  draft.enable()

  // Fetch the document to validate it exists
  const client = getClient(true)
  const doc = await client.fetch(
    `*[_type == "home" && (_id == "drafts.singleton-home" || _id == "singleton-home")][0]`
  )

  if (!doc) {
    return new Response('Document not found', { status: 404 })
  }

  // Redirect to the homepage
  redirect('/')
}
