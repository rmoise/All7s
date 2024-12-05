import { NextResponse } from 'next/server'
import { previewClient } from '@lib/sanity'

export async function GET() {
  try {
    const data = await previewClient.fetch(
      `
      *[_type == "home" && (_id == "drafts.singleton-home" || _id == "singleton-home")] | order(_id desc)[0] {
        contentBlocks[] {
          _type,
          _key,
          backgroundVideoUrl,
          backgroundVideoFile,
          heroVideoLink,
          additionalVideos
        }
      }
    `,
      undefined,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
      }
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching current document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}
