'use client'

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
import { auth, db } from './firebase'
import type { UserProfile } from '@/types'

// ─── Providers ────────────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Creates the initial Firestore user document after registration.
 * Includes all future-proofing fields from Business Model spec.
 */
async function createUserDocument(user: User, username?: string): Promise<void> {
  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)

  // Only create if it doesn't already exist (prevents overwrite on re-login)
  if (!snapshot.exists()) {
    const newUser: Omit<UserProfile, 'createdAt'> & { createdAt: unknown } = {
      uid:         user.uid,
      username:    username ?? user.email?.split('@')[0] ?? user.uid.slice(0, 8),
      displayName: user.displayName ?? username ?? 'Lanvip User',
      bio:         '',
      avatarUrl:   user.photoURL ?? '',
      themeSettings: {
        bgType:    'mesh',
        colors:    ['#f5f0ff', '#e0f0ff'],
        cardStyle: 'glass',
        darkMode:  false,
      },
      views: 0,
      // Business Model fields — default to free tier
      planId:         'free',
      organizationId: null,
      isNfcEnabled:   false,
      createdAt:      serverTimestamp(),
    }
    await setDoc(userRef, newUser)
  }
}

// ─── Auth Operations ──────────────────────────────────────────────────────────

export async function registerWithEmail(
  email: string,
  password: string,
  username: string,
  displayName: string,
): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  await createUserDocument(user, username)
  return user
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function loginWithGoogle(): Promise<User> {
  const { user } = await signInWithPopup(auth, googleProvider)
  await createUserDocument(user)
  return user
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

// ─── Firestore Queries ────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}
