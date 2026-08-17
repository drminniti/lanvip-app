import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware for protecting /dashboard routes.
 *
 * Strategy: Firebase Auth tokens are HttpOnly cookies and cannot be read
 * in the Edge Runtime. We rely on a lightweight session cookie
 * (__session) set by the client after login.
 *
 * The definitive auth check is done server-side in each Dashboard layout/page.
 * This middleware provides a fast redirect for completely unauthenticated users.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for session cookie (set by AuthProvider after successful login)
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
    /*
     * Match all routes EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico
     * - public assets
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
