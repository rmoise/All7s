import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/studio')) {
    return NextResponse.next()
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/studio/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}