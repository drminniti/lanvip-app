import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        /**
         * Auth routes (/login, /register) need COOP: unsafe-none
         * so that the Firebase Auth popup (which opens lanvip-app.firebaseapp.com)
         * can postMessage back to the opener window after Google OAuth.
         *
         * WHY: With `same-origin-allow-popups`, cross-origin popups that have
         * their own COOP header lose the opener reference and can't communicate
         * back. Firebase's auth handler at firebaseapp.com has its own COOP
         * policy. `unsafe-none` fully removes COOP from these routes, allowing
         * all popup communication — acceptable on auth pages since no sensitive
         * data is rendered there.
         */
        source: '/(login|register)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none' },
        ],
      },
      {
        // All other routes: keep reasonable COOP protection
        source: '/((?!login|register).*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
}

export default nextConfig
