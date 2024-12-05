import { NextResponse } from 'next/server'
import { previewClient } from '@lib/sanity'
import { WebSocket, WebSocketServer } from 'ws'

// Extend global to include our WebSocket server
declare global {
  var wss: WebSocketServer | undefined
}

if (!global.wss) {
  global.wss = new WebSocketServer({ noServer: true })
}

export async function GET() {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue('data: connected\n\n')
      }
    }), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    }
  )
}