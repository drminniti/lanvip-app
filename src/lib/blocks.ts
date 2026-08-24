/**
 * blocks.ts — Firestore CRUD for the `blocks` collection.
 * See 2_Architecture.md §5 for the data schema.
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Block, BlockType, BlockContent, SpanSize } from '@/types'

const COL = 'blocks'

// ─── Read (reactive) ─────────────────────────────────────────────────────────

/**
 * Subscribe to all blocks for a user, ordered by `order` ascending.
 * Returns an unsubscribe function.
 */
export function subscribeToBlocks(
  userId: string,
  callback: (blocks: Block[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('order', 'asc'),
  )
  return onSnapshot(q, snapshot => {
    const blocks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Block))
    callback(blocks)
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

export interface AddBlockPayload {
  type: BlockType
  content: BlockContent
  spanSize: SpanSize
  /** Current number of blocks — used to set initial `order` at the end. */
  currentCount: number
}

export async function addBlock(
  userId: string,
  { type, content, spanSize, currentCount }: AddBlockPayload,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    userId,
    type,
    content,
    layout: { spanSize },
    order: currentCount,        // append at the end
    clickCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBlock(
  blockId: string,
  data: Partial<Pick<Block, 'content' | 'layout' | 'isActive'>>,
): Promise<void> {
  await updateDoc(doc(db, COL, blockId), data)
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBlock(blockId: string): Promise<void> {
  await deleteDoc(doc(db, COL, blockId))
}

// ─── Reorder (batch write) ────────────────────────────────────────────────────

/**
 * Persists a new order for the given blocks array.
 * Uses a Firestore batch write so all updates are atomic.
 */
export async function reorderBlocks(blocks: Block[]): Promise<void> {
  const batch = writeBatch(db)
  blocks.forEach((block, idx) => {
    batch.update(doc(db, COL, block.id), { order: idx })
  })
  await batch.commit()
}
