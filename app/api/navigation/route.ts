import { NextResponse } from 'next/server'
import { getClient } from '@lib/sanity'

export async function GET() {
  try {
    const navigation = await getClient().fetch(`
      *[_type == "settings"][0]{
        navbar {
          navigationLinks[] {
            name,
            href,
            contentBlocks[] {
              _type,
              _key,
              listenTitle,
              lookTitle
            }
          }
        }
      }
    `)

    if (!navigation) {
      return NextResponse.json({ error: 'Navigation not found' }, { status: 404 })
    }

    return NextResponse.json(navigation)
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 })
  }
} 