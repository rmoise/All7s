import { NextResponse } from 'next/server';
import { getClient } from '@lib/sanity';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const client = getClient();
    await client.patch('navbar')
      .set({ title })
      .commit();

    return NextResponse.json({ message: 'Title updated successfully' });
  } catch (error: any) {
    console.error('Error updating navbar title:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update title' },
      { status: 500 }
    );
  }
}