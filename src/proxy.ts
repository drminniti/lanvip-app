import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl
  
  // Get hostname of request (e.g. damian.com, localhost:3000)
  let hostname = req.headers.get('host') || ''
  
  // Remove port if exists and strip 'www.' for consistent matching
  hostname = hostname.split(':')[0].replace(/^www\./, '')

  const allowedDomains = [
    'localhost',
    'lanvip.app',
    'www.lanvip.app',
    'lanvip-app.vercel.app'
  ]

  // If the hostname is a Vercel preview URL, we allow it (ends with .vercel.app)
  const isVercelDomain = hostname.endsWith('.vercel.app')

  // If the hostname is NOT one of our allowed core domains, it's a custom domain!
  if (!allowedDomains.includes(hostname) && !isVercelDomain) {
    // Rewrite to our dynamic route domain/[domain]/[path]
    return NextResponse.rewrite(new URL(`/domain/${hostname}${url.pathname}`, req.url))
  }

  return NextResponse.next()
}
