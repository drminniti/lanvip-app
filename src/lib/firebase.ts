// NOTE: No 'use client' directive — library module, not a React component.

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
 * WHY globalThis instead of module-level `let` variables?
 *
 * In Next.js dev mode, Hot Module Replacement (HMR) re-evaluates modules
 * on every file save. Module-level variables (`let _auth`) are reset to
 * `undefined` on each re-evaluation. This causes `initializeAuth` to be
 * called again on an already-initialized Firebase app, which:
 *   1. Throws `auth/already-initialized` (caught, but auth state is lost)
 *   2. Falls back to `getAuth()` which may return a stale/invalid instance
 *   3. `signInWithPopup` receives this invalid instance → `auth/argument-error`
 *
 * `globalThis` persists across HMR re-evaluations (it is the global object,
 * shared between all module evaluations in the same Node.js/browser process).
 * Firebase is therefore only ever initialized once per runtime session.
 *
 * This is the pattern recommended by Prisma, Firebase, and the Next.js docs
 * for any singleton that must survive HMR.
 */

// Augment globalThis with typed Lanvip singletons
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
 * Returns the Auth singleton with `browserLocalPersistence` (localStorage).
 *
 * WHY browserLocalPersistence instead of the default indexedDBLocalPersistence?
 * IndexedDB has an async open/close lifecycle. Under Next.js HMR the page can
 * unmount while an IndexedDB transaction is still in-flight, leaving the DB
 * in a "closing" state. The next signInWithPopup call then fails with:
 *   "Error: Database is closing/hidden"
 *
 * localStorage is synchronous — no open/close lifecycle, immune to HMR races.
 * Auth state still persists across page refreshes as expected.
 */
export function getFirebaseAuth(): Auth {
  if (globalThis.__lanvip_auth) return globalThis.__lanvip_auth

  const app = getFirebaseApp()

  try {
    globalThis.__lanvip_auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    })
    console.info('[Lanvip] Firebase Auth initialized (browserLocalPersistence)')
  } catch (err: unknown) {
    // auth/already-initialized is expected on HMR re-runs.
    // Any other error is also recovered by returning the existing instance.
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as { code: string }).code
        : 'unknown'

    if (code !== 'auth/already-initialized') {
      console.error('[Lanvip] getFirebaseAuth unexpected error:', code, err)
    }

    // getAuth() safely retrieves whatever instance was already configured
    globalThis.__lanvip_auth = getAuth(app)
    console.info('[Lanvip] Firebase Auth reused existing instance (code:', code, ')')
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
