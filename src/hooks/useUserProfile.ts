'use client'

import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { getFirebaseDb } from '@/lib/firebase'
import type { UserProfile } from '@/types'

interface UseUserProfileResult {
  profile:  UserProfile | null
  loading:  boolean
  error:    string | null
}

/**
 * Reactive hook that subscribes to the Firestore `users/{uid}` document
 * via onSnapshot. Updates in real-time (avatar, theme, bio, etc.).
 *
 * Returns null while loading or if the document doesn't exist.
 * The caller is responsible for redirecting to /onboarding when
 * profile.hasCompletedOnboarding === false.
 */
export function useUserProfile(uid: string | undefined): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      setProfile(null)
      return
    }

    const db      = getFirebaseDb()
    const userRef = doc(db, 'users', uid)

    const unsubscribe = onSnapshot(
      userRef,
      snapshot => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile)
        } else {
          setProfile(null)
        }
        setLoading(false)
        setError(null)
      },
      err => {
        console.error('[Lanvip] useUserProfile — snapshot error:', err)
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [uid])

  return { profile, loading, error }
}
