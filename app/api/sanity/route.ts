import { NextResponse } from 'next/server'
import { getClient } from '@lib/sanity'

export async function POST(request: Request) {
  try {
    const { query, params } = await request.json()
    const data = await getClient().fetch(query, params)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Sanity query error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
} 