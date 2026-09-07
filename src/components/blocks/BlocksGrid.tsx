'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { updateBlock, deleteBlock, reorderBlocks } from '@/lib/blocks'
import { BlockCard } from './BlockCard'
import type { Block } from '@/types'


interface BlocksGridProps {
  blocks:  Block[]
  /** Callback to open the edit modal for a specific block. Admin-only. */
  onEdit?: (block: Block) => void
}

/**
 * BlocksGrid — Editor drag-and-drop list.
 *
 * Architecture decision:
 *   The editor uses a vertical list (verticalListSortingStrategy) instead of
 *   a 2D Bento grid. rectSortingStrategy breaks with mixed-size items (col-span-1
 *   + col-span-2) because the rect-collision algorithm can't reliably compute
 *   drop positions for asymmetric grid layouts.
 *
 *   verticalListSortingStrategy is O(n) and bulletproof: each item has uniform
 *   height, neighbours shift predictably, and the snap-back bug is impossible.
 *
 *   The Bento grid layout (featured vs compact tiles) is preserved in the PUBLIC
 *   landing page (PublicLanding.tsx) — the visual presentation is unaffected.
 *   The editor is about management, the public view is about presentation.
 */
export function BlocksGrid({ blocks: liveBlocks, onEdit }: BlocksGridProps) {
  const [dragSnapshot, setDragSnapshot] = useState<Block[] | null>(null)

  // What gets rendered: snapshot during drag, live data otherwise
  const displayBlocks = dragSnapshot ?? liveBlocks

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 150, tolerance: 6 } }),
  )

  function handleDragStart(_event: DragStartEvent) {
    setDragSnapshot([...liveBlocks])
  }

  /**
   * Update snapshot in real-time as the pointer moves over items.
   * This makes neighbours immediately shift to show the landing position.
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || !dragSnapshot) return
    const oldIndex = dragSnapshot.findIndex(b => b.id === active.id)
    const newIndex = dragSnapshot.findIndex(b => b.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      setDragSnapshot(arrayMove(dragSnapshot, oldIndex, newIndex))
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const finalSnapshot = dragSnapshot

    // ⚠️ Persist FIRST — only then clear snapshot.
    // Clearing before the write reverts to stale liveBlocks while Firestore writes.
    if (over && active.id !== over.id && finalSnapshot) {
      await reorderBlocks(finalSnapshot)
    }

    setDragSnapshot(null)
  }

  function handleDragCancel() {
    setDragSnapshot(null)
  }

  async function handleToggle(block: Block) {
    await updateBlock(block.id, { isActive: !block.isActive })
  }

  async function handleDelete(blockId: string) {
    await deleteBlock(blockId)
  }

  if (liveBlocks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-10 space-y-2"
      >
        <p className="text-2xl">⬜</p>
        <p className="text-sm" style={{ color: '#A3A3A3' }}>
          Todavía no tenés bloques. ¡Agregá el primero!
        </p>
      </motion.div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={displayBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {displayBlocks.map(block => (
            <BlockCard
              key={block.id}
              block={block}
              onEdit={onEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
