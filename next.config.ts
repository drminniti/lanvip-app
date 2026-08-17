import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          /**
           * Cross-Origin-Opener-Policy fix for Firebase Auth Google popup.
           *
           * Next.js sets COOP to 'same-origin' by default, which blocks the
           * Google OAuth popup from calling window.close() and postMessage()
           * back to the opener. Symptom: popup freezes after account selection,
           * console shows: "COOP policy would block the window.close call".
           *
           * 'same-origin-allow-popups' keeps cross-origin navigation protection
           * while allowing popup windows opened from the same origin (our app)
           * to communicate back — which is exactly what Firebase Auth requires.
           *
           * Reference: https://firebase.google.com/docs/auth/web/google-signin
           */
          {
            key:   'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

export default nextConfig
