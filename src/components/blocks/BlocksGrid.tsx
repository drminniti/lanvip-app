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
  rectSortingStrategy,
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

export function BlocksGrid({ blocks: liveBlocks, onEdit }: BlocksGridProps) {
  // During an active drag we work on a local snapshot so the UI stays snappy.
  // Outside of a drag we always use liveBlocks directly (Firestore source of truth).
  const [dragSnapshot, setDragSnapshot] = useState<Block[] | null>(null)

  // What gets rendered: snapshot during drag, live data otherwise
  const displayBlocks = dragSnapshot ?? liveBlocks

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart(_event: DragStartEvent) {
    // Capture a snapshot of current live blocks at drag start
    setDragSnapshot(liveBlocks)
  }

  /**
   * onDragOver fires continuously as the pointer moves over other items.
   * We update the snapshot in real-time so SortableContext sees the new
   * order, which makes neighbouring blocks shift while holding an item.
   * Without this handler, blocks only reorder on dragEnd (no live feedback).
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

    // ⚠️ Order matters: persist FIRST, then release the snapshot.
    // Releasing before the write causes an instant revert to stale liveBlocks
    // while Firestore is still writing — the user sees blocks snap back.
    if (over && active.id !== over.id && finalSnapshot) {
      await reorderBlocks(finalSnapshot)
    }

    // Safe to release now: Firestore onSnapshot has already fired (or will
    // fire momentarily) with the confirmed new order, so liveBlocks is ready.
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
      {/*
        rectSortingStrategy handles 2D asymmetric grids (mixed col-span-1 and
        col-span-2 items). No DragOverlay is used: the source item becomes
        opacity:0 (a clean hole) while neighbours animate into position via
        CSS transforms applied by useSortable. This avoids the sizing ambiguity
        that DragOverlay has with mixed-width grid items.
      */}
      <SortableContext items={displayBlocks.map(b => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3">
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
