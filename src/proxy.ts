import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy (replaces legacy middleware.ts).
 * Protects /dashboard routes via a lightweight __session cookie check.
 * The definitive auth verification is done server-side in each layout.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('__session')?.value

  // ── Protect all /dashboard routes ────────────────────────────────────────
  if (pathname.startsWith('/dashboard') && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect authenticated users away from auth pages ────────────────────
  if ((pathname === '/login' || pathname === '/register') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
