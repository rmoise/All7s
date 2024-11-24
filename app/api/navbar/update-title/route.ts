import { updateBlockTitleAction } from '@/app/actions/navbar'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { type, newTitle } = await request.json()
    const result = await updateBlockTitleAction(type, newTitle)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 