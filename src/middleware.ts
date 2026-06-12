import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('mock_session')?.value

  if (!session && !PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/).*)'],
}
