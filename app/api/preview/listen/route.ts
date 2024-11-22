import { NextResponse } from 'next/server'
import { previewClient } from '@/lib/client'
import { WebSocket, WebSocketServer } from 'ws'

// Extend global to include our WebSocket server
declare global {
  var wss: WebSocketServer | undefined
}

if (!global.wss) {
  global.wss = new WebSocketServer({ noServer: true })
}

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    const subscription = previewClient.listen(
      `*[_type == "home" && (_id == "drafts.singleton-home" || _id == "singleton-home")]`
    ).subscribe({
      next: () => {
        global.wss?.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'update', timestamp: Date.now() }))
          }
        })
      },
      error: (error) => {
        console.error('Preview subscription error:', error)
        global.wss?.clients.forEach((client: WebSocket) => client.close())
      }
    })

    return new NextResponse(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade'
      }
    })
  }

  return new NextResponse('WebSocket not available in production', { status: 400 })
}