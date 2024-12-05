import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getClient } from '@/lib/sanity'
import { setPreviewToken } from '@/lib/preview'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const preview = searchParams.get('preview')

    if (preview !== '1') {
      return new Response('Invalid preview mode', { status: 401 })
    }

    const token = process.env.SANITY_API_TOKEN
    if (!token) {
      console.error('Missing SANITY_API_TOKEN')
      return new Response('Configuration error', { status: 500 })
    }

    // Set preview token
    await setPreviewToken(token)

    // Enable draft mode
    const draft = await draftMode()
    await draft.enable()

    // Fetch the document to validate it exists
    const client = getClient(true)
    const doc = await client.fetch(
      `*[_type == "home" && (_id == "drafts.singleton-home" || _id == "singleton-home")][0]`
    )

    if (!doc) {
      console.error('No document found')
      return new Response('Document not found', { status: 404 })
    }

    // Redirect to the homepage with preview parameter
    redirect('/?preview=1')
  } catch (error) {
    console.error('Preview error:', error)
    return new Response('Preview error', { status: 500 })
  }
}
