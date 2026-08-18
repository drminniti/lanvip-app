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
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb, browserPopupRedirectResolver } from './firebase'
import type { UserProfile, ThemeSettings } from '@/types'
import { VIP_THEMES } from './themes'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates the Firestore user document after first login.
 * Retries on transient 'unavailable'/'offline' errors (Firestore WebSocket
 * hasn't connected yet right after page load).
 *
 * @param withExplicitUsername - true for email/password registration (user
 *   chose a username), false for Google OAuth (auto-assigned from email).
 *   Controls the hasCompletedOnboarding flag.
 */
async function createUserDocument(
  user: User,
  username?: string,
  withExplicitUsername = false,
  attempt = 1,
): Promise<void> {
  const MAX_ATTEMPTS  = 4
  const RETRY_BASE_MS = 600

  const db      = getFirebaseDb()
  const userRef = doc(db, 'users', user.uid)

  try {
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
      const defaultTheme = VIP_THEMES[0].settings  // Obsidian

      const newUser: Omit<UserProfile, 'createdAt'> & { createdAt: unknown } = {
        uid:         user.uid,
        username:    username ?? user.email?.split('@')[0] ?? user.uid.slice(0, 8),
        displayName: user.displayName ?? username ?? 'Lanvip User',
        bio:         '',
        // No Firebase Storage: use Google photoURL as default, empty string otherwise
        avatarUrl:   user.photoURL ?? '',
        themeSettings:           defaultTheme,
        views:                   0,
        planId:                  'free',
        organizationId:          null,
        isNfcEnabled:            false,
        hasCompletedOnboarding:  withExplicitUsername,
        createdAt:               serverTimestamp(),
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
      return createUserDocument(user, username, withExplicitUsername, attempt + 1)
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
  // Email registration: user explicitly chose username → hasCompletedOnboarding = true
  await createUserDocument(user, username, true)
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
 * COOP: unsafe-none is set on /login and /register routes (next.config.ts)
 * to allow the Firebase popup to postMessage back after OAuth.
 *
 * New Google users get hasCompletedOnboarding = false → redirected to /onboarding.
 */
export async function loginWithGoogle(): Promise<User> {
  const auth           = getFirebaseAuth()
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  console.info('[Lanvip] loginWithGoogle — opening popup')
  const { user } = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)

  try {
    // Google users: withExplicitUsername = false → onboarding required
    await createUserDocument(user, undefined, false)
  } catch (firestoreErr) {
    console.error('[Lanvip] loginWithGoogle — Firestore doc creation failed (user authenticated):', firestoreErr)
  }

  console.info('[Lanvip] loginWithGoogle — success, uid:', user.uid)
  return user
}

// ─── Profile Update Operations ────────────────────────────────────────────────

export interface UpdateProfileData {
  displayName?:    string
  username?:       string
  bio?:            string
  avatarUrl?:      string
  themeSettings?:  ThemeSettings
}

/**
 * Updates the user's Firestore document with the provided fields.
 * Also updates Firebase Auth displayName if provided.
 */
export async function updateUserProfile(
  uid: string,
  data: UpdateProfileData,
): Promise<void> {
  const db      = getFirebaseDb()
  const userRef = doc(db, 'users', uid)

  await updateDoc(userRef, { ...data })
  console.info('[Lanvip] updateUserProfile — updated fields:', Object.keys(data))

  // Keep Firebase Auth profile in sync
  const auth = getFirebaseAuth()
  if (auth.currentUser && data.displayName) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName,
      ...(data.avatarUrl ? { photoURL: data.avatarUrl } : {}),
    })
  }
}

/**
 * Completes the onboarding flow: sets the chosen username, displayName,
 * and marks hasCompletedOnboarding = true.
 */
export async function completeOnboarding(
  uid: string,
  username: string,
  displayName: string,
): Promise<void> {
  const db      = getFirebaseDb()
  const userRef = doc(db, 'users', uid)

  await updateDoc(userRef, {
    username,
    displayName,
    hasCompletedOnboarding: true,
  })

  const auth = getFirebaseAuth()
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName })
  }

  console.info('[Lanvip] completeOnboarding — uid:', uid, 'username:', username)
}

/**
 * Checks whether a username is already taken in Firestore.
 * Returns true if available, false if taken.
 * Excludes the current user's own uid to allow re-saving the same username.
 */
export async function checkUsernameAvailable(
  username: string,
  currentUid: string,
): Promise<boolean> {
  if (!username || username.length < 3) return false

  const db      = getFirebaseDb()
  const usersCol = collection(db, 'users')
  const q        = query(usersCol, where('username', '==', username))
  const snap     = await getDocs(q)

  if (snap.empty) return true

  // Allow if the only match is the current user (re-saving same username)
  return snap.docs.every(d => d.id === currentUid)
}

// ─── Auth Listeners ───────────────────────────────────────────────────────────

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
