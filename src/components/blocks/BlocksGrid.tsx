'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { updateBlock, deleteBlock, reorderBlocks } from '@/lib/blocks'
import { BlockCard } from './BlockCard'
import type { Block } from '@/types'

interface BlocksGridProps {
  blocks:  Block[]
  accent:  string
  onEdit?: (block: Block) => void
}

export function BlocksGrid({ blocks: liveBlocks, accent, onEdit }: BlocksGridProps) {
  // Local copy for optimistic updates — stays in sync with liveBlocks
  // when not dragging, and holds the reordered state after a drag until
  // Firestore confirms the new order via onSnapshot.
  const [localBlocks, setLocalBlocks] = useState<Block[]>(liveBlocks)

  // Keep localBlocks in sync when Firestore delivers updates
  useEffect(() => {
    setLocalBlocks(liveBlocks)
  }, [liveBlocks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 100, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return

    const oldIndex = localBlocks.findIndex(b => b.id === active.id)
    const newIndex = localBlocks.findIndex(b => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(localBlocks, oldIndex, newIndex)

    // Optimistic update — show the new order immediately
    setLocalBlocks(reordered)

    // Persist to Firestore (fire-and-forget; onSnapshot will confirm)
    reorderBlocks(reordered).catch(() => {
      // On error, revert to last known Firestore state
      setLocalBlocks(liveBlocks)
    })
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
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localBlocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {localBlocks.map(block => (
            <BlockCard
              key={block.id}
              block={block}
              accent={accent}
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
