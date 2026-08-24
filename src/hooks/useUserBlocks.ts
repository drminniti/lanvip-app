'use client'

import { useState, useEffect } from 'react'
import { subscribeToBlocks } from '@/lib/blocks'
import type { Block } from '@/types'

/**
 * Reactive hook that returns all blocks for a user via Firestore onSnapshot.
 * Blocks are pre-sorted by `order` (ascending) from the Firestore query.
 */
export function useUserBlocks(userId: string | undefined) {
  const [blocks, setBlocks]   = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setBlocks([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToBlocks(userId, receivedBlocks => {
      setBlocks(receivedBlocks)
      setLoading(false)
    })

    return unsubscribe
  }, [userId])

  return { blocks, loading }
}
