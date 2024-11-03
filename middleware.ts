import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle studio routes
  if (request.nextUrl.pathname.startsWith('/studio')) {
    return NextResponse.rewrite(new URL('https://all7z.sanity.studio' + request.nextUrl.pathname, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/studio/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 