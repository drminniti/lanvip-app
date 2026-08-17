// NOTE: No 'use client' directive — library module, not a React component.
// The 'use client' boundary is owned by the components that import this module.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
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
 * Module-level singletons — survive Next.js HMR without re-initialising.
 * These are undefined on the server (SSR) and populated lazily on the client.
 */
let _app:     FirebaseApp     | undefined
let _auth:    Auth            | undefined
let _db:      Firestore       | undefined
let _storage: FirebaseStorage | undefined

// ─── Firebase App ─────────────────────────────────────────────────────────────
function getFirebaseApp(): FirebaseApp {
  if (_app) return _app
  _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  return _app
}

// ─── Firebase Auth ────────────────────────────────────────────────────────────
/**
 * Returns the Auth singleton, configured with `browserLocalPersistence`
 * (localStorage) instead of the default IndexedDB persistence.
 *
 * WHY: Firebase Auth's IndexedDB persistence (`indexedDBLocalPersistence`)
 * triggers the "Database is closing/hidden" error in Next.js because:
 *   1. HMR unmounts components while IndexedDB connections are still open.
 *   2. The next hot-reload attempt finds the DB in a closing state and throws.
 *
 * `browserLocalPersistence` uses `localStorage` which has no async open/close
 * lifecycle, so it is immune to this race condition. Auth state still persists
 * across page refreshes as expected.
 *
 * On HMR re-runs, `initializeAuth` throws "auth/already-initialized"; the
 * catch block returns the existing instance via `getAuth()` — safe to reuse.
 */
export function getFirebaseAuth(): Auth {
  if (_auth) return _auth

  const app = getFirebaseApp()

  try {
    _auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    })
    console.info('[Lanvip] Firebase Auth initialized with browserLocalPersistence')
  } catch (err: unknown) {
    // auth/already-initialized — happens on Next.js HMR hot-reload.
    // getAuth() safely returns the already-configured instance.
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === 'auth/already-initialized'
    ) {
      console.info('[Lanvip] Firebase Auth already initialized — reusing instance')
    } else {
      console.error('[Lanvip] getFirebaseAuth — unexpected error:', err)
    }
    _auth = getAuth(app)
  }

  return _auth
}

// ─── Firestore ────────────────────────────────────────────────────────────────
export function getFirebaseDb(): Firestore {
  if (_db) return _db
  _db = getFirestore(getFirebaseApp())
  return _db
}

// ─── Storage ──────────────────────────────────────────────────────────────────
export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage
  _storage = getStorage(getFirebaseApp())
  return _storage
}

export { getFirebaseApp }
