// NOTE: No 'use client' directive — library module, not a React component.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  Auth,
} from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

/**
 * WHY globalThis?
 * Next.js HMR re-evaluates modules on every hot-reload, resetting module-level
 * `let` variables to undefined. globalThis persists across re-evaluations.
 * This is the pattern used by Prisma, Firebase Admin, and Next.js docs.
 */
declare global {
  // eslint-disable-next-line no-var
  var __lanvip_app:     FirebaseApp     | undefined
  // eslint-disable-next-line no-var
  var __lanvip_auth:    Auth            | undefined
  // eslint-disable-next-line no-var
  var __lanvip_db:      Firestore       | undefined
  // eslint-disable-next-line no-var
  var __lanvip_storage: FirebaseStorage | undefined
}

// ─── Firebase App ─────────────────────────────────────────────────────────────
function getFirebaseApp(): FirebaseApp {
  if (globalThis.__lanvip_app) return globalThis.__lanvip_app
  globalThis.__lanvip_app =
    getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return globalThis.__lanvip_app
}

// ─── Firebase Auth ────────────────────────────────────────────────────────────
/**
 * Initialises Auth with:
 * - browserLocalPersistence: avoids IndexedDB "closing" errors with HMR
 * - browserPopupRedirectResolver: required for signInWithRedirect in Next.js
 *   (Turbopack cannot auto-detect the resolver from the SSR module context)
 */
export function getFirebaseAuth(): Auth {
  if (globalThis.__lanvip_auth) return globalThis.__lanvip_auth

  const app = getFirebaseApp()

  try {
    globalThis.__lanvip_auth = initializeAuth(app, {
      persistence:           browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    })
    console.info('[Lanvip] Firebase Auth initialized')
  } catch (err: unknown) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as { code: string }).code
        : 'unknown'
    if (code !== 'auth/already-initialized') {
      console.error('[Lanvip] getFirebaseAuth unexpected error:', code, err)
    }
    globalThis.__lanvip_auth = getAuth(app)
    console.info('[Lanvip] Firebase Auth reused existing instance')
  }

  return globalThis.__lanvip_auth
}

// ─── Firestore ────────────────────────────────────────────────────────────────
export function getFirebaseDb(): Firestore {
  if (globalThis.__lanvip_db) return globalThis.__lanvip_db
  globalThis.__lanvip_db = getFirestore(getFirebaseApp())
  return globalThis.__lanvip_db
}

// ─── Storage ──────────────────────────────────────────────────────────────────
export function getFirebaseStorage(): FirebaseStorage {
  if (globalThis.__lanvip_storage) return globalThis.__lanvip_storage
  globalThis.__lanvip_storage = getStorage(getFirebaseApp())
  return globalThis.__lanvip_storage
}

export { getFirebaseApp }
