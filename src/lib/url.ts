/**
 * Sanitizes URLs to prevent Cross-Site Scripting (XSS).
 * Only allows safe protocols (http, https, mailto, tel).
 * If the URL is invalid or uses an unsafe protocol (like javascript:), it returns undefined.
 */
export function sanitizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return url
    }
    return undefined
  } catch {
    // If it throws, it's not a valid URL (or might be a relative path, which we don't want either)
    return undefined
  }
}
