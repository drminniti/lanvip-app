// NOTE: No 'use client' directive — library module, not a React component.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
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
import { getFirebaseAuth, getFirebaseDb } from './firebase'
import type { UserProfile } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates the Firestore user document after first login.
 * Retries on 'unavailable' / 'offline' errors because after signInWithRedirect
 * the Firestore WebSocket hasn't connected when this is called. The retry loop
 * gives the SDK time to establish the connection (~200-800ms typically).
 */
async function createUserDocument(
  user: User,
  username?: string,
  attempt = 1,
): Promise<void> {
  const MAX_ATTEMPTS  = 4
  const RETRY_BASE_MS = 600   // 600 → 1200 → 1800ms

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
      console.info('[Lanvip] createUserDocument — doc created for uid:', user.uid)
    } else {
      console.info('[Lanvip] createUserDocument — doc already exists for uid:', user.uid)
    }
  } catch (err: unknown) {
    // Determine if the error is a transient connectivity issue
    const code = typeof err === 'object' && err !== null && 'code' in err
      ? (err as { code: string }).code
      : ''
    const msg = typeof err === 'object' && err !== null && 'message' in err
      ? String((err as { message: unknown }).message)
      : ''
    const isTransient =
      code === 'unavailable' ||
      msg.includes('offline') ||
      msg.includes('client is offline')

    if (isTransient && attempt < MAX_ATTEMPTS) {
      const delay = RETRY_BASE_MS * attempt
      console.warn(
        `[Lanvip] Firestore not ready (attempt ${attempt}/${MAX_ATTEMPTS - 1}),` +
        ` retrying in ${delay}ms…`,
      )
      await new Promise(resolve => setTimeout(resolve, delay))
      return createUserDocument(user, username, attempt + 1)
    }

    // Non-transient error or max retries reached
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
  console.info('[Lanvip] registerWithEmail — attempting:', email)
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  await createUserDocument(user, username)
  console.info('[Lanvip] registerWithEmail — success, uid:', user.uid)
  return user
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const auth = getFirebaseAuth()
  console.info('[Lanvip] loginWithEmail — attempting:', email)
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  console.info('[Lanvip] loginWithEmail — success, uid:', user.uid)
  return user
}

/**
 * Initiates Google Sign-In via REDIRECT (not popup).
 *
 * WHY redirect instead of popup?
 * - signInWithPopup is blocked by the Cross-Origin-Opener-Policy (COOP) header
 *   that Next.js sets by default. The COOP header prevents the popup from
 *   calling window.close() / window.closed back to the opener, freezing the flow.
 * - signInWithRedirect avoids COOP entirely — it navigates the current tab to
 *   Google, authenticates, then returns to the app via a redirect URL.
 * - This is Firebase's recommended approach for Next.js and other SSR frameworks.
 *
 * NOTE: This function navigates AWAY from the current page.
 * Call handleGoogleRedirectResult() on page mount to pick up the result.
 */
export async function loginWithGoogle(): Promise<void> {
  const auth           = getFirebaseAuth()
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  console.info('[Lanvip] loginWithGoogle — initiating redirect to Google')
  await signInWithRedirect(auth, googleProvider)
  // ← Browser navigates away here. No code after this runs in this page load.
}

/**
 * Checks for a pending Google redirect result on page mount.
 * Must be called in a useEffect in the login/register pages.
 * Returns the authenticated User if a redirect result is present, or null.
 */
export async function handleGoogleRedirectResult(): Promise<User | null> {
  const auth = getFirebaseAuth()
  console.info('[Lanvip] handleGoogleRedirectResult — checking for redirect result')

  const result = await getRedirectResult(auth)

  if (result) {
    console.info('[Lanvip] handleGoogleRedirectResult — user found:', result.user.uid)
    try {
      await createUserDocument(result.user)
    } catch (firestoreErr) {
      // Auth succeeded — don't block the user from entering the app.
      // The user document can be created on next login or via a background task.
      console.error(
        '[Lanvip] handleGoogleRedirectResult — Firestore doc creation failed' +
        ' (user still authenticated):', firestoreErr,
      )
    }
    return result.user
  }

  console.info('[Lanvip] handleGoogleRedirectResult — no redirect result')
  return null
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
