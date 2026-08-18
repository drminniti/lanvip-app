// NOTE: No 'use client' directive — library module, not a React component.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import {
  getAuth,
  setPersistence,
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
 * Uses getAuth() (simplest initialization) instead of initializeAuth()
 * to avoid any custom-option interference with the redirect flow.
 * Persistence is set async via setPersistence() — non-blocking.
 */
export function getFirebaseAuth(): Auth {
  if (globalThis.__lanvip_auth) return globalThis.__lanvip_auth

  const app  = getFirebaseApp()
  const auth = getAuth(app)

  // Set localStorage persistence asynchronously — avoids blocking auth init
  // and avoids IndexedDB HMR issues without interfering with redirect state.
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn('[Lanvip] setPersistence failed (non-critical):', err)
  })

  globalThis.__lanvip_auth = auth
  console.info(
    '[Lanvip] Firebase Auth initialized — apiKey prefix:',
    firebaseConfig.apiKey?.slice(0, 8),
    '— authDomain:', firebaseConfig.authDomain,
  )
  return globalThis.__lanvip_auth
}

// Re-export resolver so auth.ts can import from one place
export { browserPopupRedirectResolver }

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
