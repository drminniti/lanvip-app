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

async function createUserDocument(user: User, username?: string): Promise<void> {
  const db      = getFirebaseDb()
  const userRef = doc(db, 'users', user.uid)

  let snapshot
  try {
    snapshot = await getDoc(userRef)
  } catch (err) {
    console.error('[Lanvip] createUserDocument — getDoc failed:', err)
    throw err
  }

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
    try {
      await setDoc(userRef, newUser)
    } catch (err) {
      console.error('[Lanvip] createUserDocument — setDoc failed:', err)
      throw err
    }
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
    await createUserDocument(result.user)
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
