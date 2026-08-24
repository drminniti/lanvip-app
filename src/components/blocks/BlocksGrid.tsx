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
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { updateBlock, deleteBlock, reorderBlocks } from '@/lib/blocks'
import { BlockCard } from './BlockCard'
import type { Block } from '@/types'

interface BlocksGridProps {
  blocks: Block[]
}

export function BlocksGrid({ blocks: initialBlocks }: BlocksGridProps) {
  // Local copy for optimistic drag & drop reorder
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

  // Keep in sync when Firestore updates arrive (from parent via onSnapshot)
  // We only update if we're not mid-drag
  const [isDragging, setIsDragging] = useState(false)
  if (!isDragging && JSON.stringify(blocks.map(b => b.id)) !== JSON.stringify(initialBlocks.map(b => b.id))) {
    setBlocks(initialBlocks)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex(b => b.id === active.id)
    const newIndex = blocks.findIndex(b => b.id === over.id)
    const reordered = arrayMove(blocks, oldIndex, newIndex)

    setBlocks(reordered) // optimistic
    await reorderBlocks(reordered)
  }

  async function handleToggle(block: Block) {
    await updateBlock(block.id, { isActive: !block.isActive })
  }

  async function handleDelete(blockId: string) {
    await deleteBlock(blockId)
  }

  if (blocks.length === 0) {
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
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setIsDragging(false)}
    >
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          <AnimatePresence>
            {blocks.map(block => (
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
