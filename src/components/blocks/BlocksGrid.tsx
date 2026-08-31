'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
  blocks: Block[]
}

export function BlocksGrid({ blocks: liveBlocks }: BlocksGridProps) {
  // During an active drag we work on a local snapshot so the UI stays snappy.
  // Outside of a drag we always use liveBlocks directly (Firestore source of truth).
  const [dragSnapshot, setDragSnapshot] = useState<Block[] | null>(null)
  const isDragging = dragSnapshot !== null

  // What gets rendered: snapshot during drag, live data otherwise
  const displayBlocks = isDragging ? dragSnapshot! : liveBlocks

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart() {
    // Capture a snapshot of current live blocks at drag start
    setDragSnapshot(liveBlocks)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id && dragSnapshot) {
      const oldIndex  = dragSnapshot.findIndex(b => b.id === active.id)
      const newIndex  = dragSnapshot.findIndex(b => b.id === over.id)
      const reordered = arrayMove(dragSnapshot, oldIndex, newIndex)
      setDragSnapshot(reordered) // keep showing reordered while Firestore writes
      await reorderBlocks(reordered)
    }

    // Release snapshot — Firestore onSnapshot will deliver the confirmed order
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
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* rectSortingStrategy supports 2D asymmetric grids */}
      <SortableContext items={displayBlocks.map(b => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {displayBlocks.map(block => (
              <BlockCard
                key={block.id}
                block={block}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  )
}
