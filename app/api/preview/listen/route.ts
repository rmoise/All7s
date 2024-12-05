import { NextResponse } from 'next/server'

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('data: connected\n\n')

      // Keep connection alive with periodic pings
      const interval = setInterval(() => {
        controller.enqueue('data: ping\n\n')
      }, 15000)

      // Cleanup on close
      return () => {
        clearInterval(interval)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}