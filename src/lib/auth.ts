// NOTE: No 'use client' directive — library module, not a React component.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb, browserPopupRedirectResolver } from './firebase'
import type { UserProfile } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates the Firestore user document after first login.
 * Retries on transient 'unavailable'/'offline' errors because after page load
 * the Firestore WebSocket hasn't connected yet. Retry loop gives the SDK
 * ~600-1800ms to establish the connection before failing hard.
 */
async function createUserDocument(
  user: User,
  username?: string,
  attempt = 1,
): Promise<void> {
  const MAX_ATTEMPTS  = 4
  const RETRY_BASE_MS = 600

  const db      = getFirebaseDb()
  const userRef = doc(db, 'users', user.uid)

  try {
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      const newUser: Omit<UserProfile, 'createdAt'> & { createdAt: unknown } = {
        uid:         user.uid,
        username:    username ?? user.email?.split('@')[0] ?? user.uid.slice(0, 8),
        displayName: user.displayName ?? username ?? 'Lanvip User',
        bio:         '',
        avatarUrl:   user.photoURL ?? '',
        themeSettings: {
          bgType:    'mesh',
          colors:    ['#141208', '#0d0d0a'],
          cardStyle: 'glass',
          darkMode:  true,
        },
        views:          0,
        planId:         'free',
        organizationId: null,
        isNfcEnabled:   false,
        createdAt:      serverTimestamp(),
      }
      await setDoc(userRef, newUser)
      console.info('[Lanvip] createUserDocument — created for uid:', user.uid)
    } else {
      console.info('[Lanvip] createUserDocument — already exists for uid:', user.uid)
    }
  } catch (err: unknown) {
    const code = typeof err === 'object' && err !== null && 'code' in err
      ? (err as { code: string }).code : ''
    const msg  = typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message: unknown }).message) : ''

    const isTransient =
      code === 'unavailable' ||
      msg.includes('offline') ||
      msg.includes('client is offline')

    if (isTransient && attempt < MAX_ATTEMPTS) {
      const delay = RETRY_BASE_MS * attempt
      console.warn(`[Lanvip] Firestore not ready (attempt ${attempt}/${MAX_ATTEMPTS - 1}), retrying in ${delay}ms…`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return createUserDocument(user, username, attempt + 1)
    }

    console.error('[Lanvip] createUserDocument — failed after all retries:', err)
    throw err
  }
}

// ─── Auth Operations ──────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
  displayName: string,
): Promise<User> {
  const auth = getFirebaseAuth()
  console.info('[Lanvip] registerWithEmail —', email)
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  await createUserDocument(user, username)
  console.info('[Lanvip] registerWithEmail — success, uid:', user.uid)
  return user
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth()
  console.info('[Lanvip] loginWithEmail —', email)
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  console.info('[Lanvip] loginWithEmail — success, uid:', user.uid)
  return user
}

/**
 * Google Sign-In via POPUP with explicit browserPopupRedirectResolver.
 *
 * WHY popup (not redirect)?
 * signInWithRedirect relies on cross-domain sessionStorage state that is
 * inaccessible when Firebase redirects back to localhost, so getRedirectResult()
 * always returns null in development.
 *
 * WHY unsafe-none COOP on auth routes?
 * Firebase's popup (lanvip-app.firebaseapp.com) needs to postMessage back to
 * our window after OAuth. This cross-origin postMessage is blocked unless our
 * page sets COOP: unsafe-none (configured in next.config.ts for /login and
 * /register routes only — safe since no sensitive data is on those pages).
 */
export async function loginWithGoogle(): Promise<User> {
  const auth           = getFirebaseAuth()
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  console.info('[Lanvip] loginWithGoogle — opening popup')
  const { user } = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)
  await createUserDocument(user)
  console.info('[Lanvip] loginWithGoogle — success, uid:', user.uid)
  return user
}

export async function logout(): Promise<void> {
  const auth = getFirebaseAuth()
  await signOut(auth)
  console.info('[Lanvip] logout — signed out')
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth()
  return onAuthStateChanged(auth, callback)
}

// ─── Firestore Queries ────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db   = getFirebaseDb()
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
