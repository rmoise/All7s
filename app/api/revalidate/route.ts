import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { tag, purgeCache } = await request.json()

    // Revalidate the tag
    revalidateTag(tag)

    // If purgeCache is true, clear CDN cache if applicable
    if (purgeCache) {
      // Add your CDN cache purging logic here
      // Example for Vercel:
      await fetch(`https://api.vercel.com/v1/projects/${process.env.VERCEL_PROJECT_ID}/domains/${process.env.VERCEL_URL}/purge-cache`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        },
      })
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ revalidated: false, error: (err as Error).message }, { status: 500 })
  }
}