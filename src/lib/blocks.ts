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
  getDocs,
  writeBatch,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
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
    collection(getFirebaseDb(), COL),
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
  /** Whether this block spans the full grid width. Default: false. */
  isFeatured?: boolean
  /** Current number of blocks — used to set initial `order` at the end. */
  currentCount: number
}

export async function addBlock(
  userId: string,
  { type, content, spanSize, isFeatured = false, currentCount }: AddBlockPayload,
): Promise<string> {
  const ref = await addDoc(collection(getFirebaseDb(), COL), {
    userId,
    type,
    content,
    layout: { spanSize },
    order:      currentCount,        // append at the end
    clickCount: 0,
    isActive:   true,
    isFeatured,
    createdAt:  serverTimestamp(),
  })
  return ref.id
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBlock(
  blockId: string,
  data: Partial<Pick<Block, 'content' | 'layout' | 'isActive' | 'isFeatured'>>,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COL, blockId), data)
}

// ─── Update content (edit flow) ───────────────────────────────────────────────

export interface EditBlockPayload {
  content:    BlockContent
  isFeatured: boolean
}

/**
 * Updates only the user-editable fields of a block from the edit modal.
 * Intentionally does NOT touch: id, order, userId, clickCount, isActive, createdAt.
 *
 * See 3_UX_UI.md §6 (BlockFormModal — edit mode) for UX context.
 */
export async function updateBlockContent(
  blockId: string,
  { content, isFeatured }: EditBlockPayload,
): Promise<void> {
  await updateDoc(doc(getFirebaseDb(), COL, blockId), { content, isFeatured })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBlock(blockId: string): Promise<void> {
  await deleteDoc(doc(getFirebaseDb(), COL, blockId))
}

// ─── Reorder (batch write) ────────────────────────────────────────────────────

/**
 * Persists a new order for the given blocks array.
 * Uses a Firestore batch write so all updates are atomic.
 */
export async function reorderBlocks(blocks: Block[]): Promise<void> {
  const batch = writeBatch(getFirebaseDb())
  blocks.forEach((block, idx) => {
    batch.update(doc(getFirebaseDb(), COL, block.id), { order: idx })
  })
  await batch.commit()
}

// ─── Read (one-shot, for SSR) ─────────────────────────────────────────────────

/**
 * One-shot fetch of all active blocks for a user, ordered by `order` asc.
 * Used by the public SSR route /[username] — no subscription needed.
 *
 * Requires Firestore composite index: userId (Asc) + isActive (Asc) + order (Asc).
 * If missing, Firestore will throw with a link to create it.
 */
export async function getActiveBlocksByUserId(userId: string): Promise<Block[]> {
  const q = query(
    collection(getFirebaseDb(), COL),
    where('userId',   '==', userId),
    where('isActive', '==', true),
    orderBy('order', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Block))
}
