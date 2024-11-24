import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Named export
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Convert URLs to lowercase
  if (pathname.toLowerCase() !== pathname && !pathname.startsWith('/_next')) {
    const url = new URL(pathname.toLowerCase(), request.url)
    return NextResponse.redirect(url, {
      status: 308, // Permanent redirect
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  }

  return NextResponse.next()
}

// Configure paths that should use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser asset)
     * - public folder
     * - studio (Sanity Studio)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|studio).*)',
  ],
}