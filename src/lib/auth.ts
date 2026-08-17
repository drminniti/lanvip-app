// NOTE: No 'use client' directive — this is a utility library, not a component.
// The 'use client' boundary is owned by the components that import this module.

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
import { getFirebaseAuth, getFirebaseDb } from './firebase'
import type { UserProfile } from '@/types'

// ─── Providers ────────────────────────────────────────────────────────────────
// GoogleAuthProvider is instantiated lazily inside each function to avoid
// top-level module execution during SSR.

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Creates the initial Firestore user document after registration.
 * Includes all future-proofing fields from Business Model spec.
 */
async function createUserDocument(user: User, username?: string): Promise<void> {
  const db     = getFirebaseDb()
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
        colors:    ['#0d0d1a', '#0d1210'],
        cardStyle: 'glass',
        darkMode:  true,
      },
      views: 0,
      // Business Model fields — default to free tier (5_Business_Model.md)
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
  console.info('[Lanvip] registerWithEmail — attempting registration for:', email)
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
  console.info('[Lanvip] loginWithEmail — attempting for:', email)
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  console.info('[Lanvip] loginWithEmail — success, uid:', user.uid)
  return user
}

export async function loginWithGoogle(): Promise<User> {
  const auth           = getFirebaseAuth()
  const googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  console.info('[Lanvip] loginWithGoogle — opening popup')
  const { user } = await signInWithPopup(auth, googleProvider)
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
