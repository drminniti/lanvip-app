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
  DragOverlay,
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
  const [activeId, setActiveId]         = useState<string | null>(null)

  // What gets rendered: snapshot during drag, live data otherwise
  const displayBlocks = dragSnapshot ?? liveBlocks
  const activeBlock   = activeId ? displayBlocks.find(b => b.id === activeId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    // Capture a snapshot of current live blocks at drag start
    setDragSnapshot(liveBlocks)
    setActiveId(String(event.active.id))
  }

  /**
   * onDragOver fires continuously as the pointer moves over other items.
   * We update the snapshot in real-time so SortableContext sees the new
   * order and dnd-kit applies the correct shift transforms to neighbours.
   * Without this handler, blocks don't move until dragEnd.
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
    setActiveId(null)
    setDragSnapshot(null)

    // Persist the final order that was built up by onDragOver
    if (over && active.id !== over.id && finalSnapshot) {
      await reorderBlocks(finalSnapshot)
    }
  }

  function handleDragCancel() {
    setActiveId(null)
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
      {/* rectSortingStrategy supports 2D asymmetric grids */}
      <SortableContext items={displayBlocks.map(b => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {displayBlocks.map(block => (
              <BlockCard
                key={block.id}
                block={block}
                onEdit={onEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>

      {/*
        DragOverlay renders the dragged block as a floating layer outside
        the grid flow, preventing layout-shift artifacts and giving a
        crisp "lifted card" effect while dragging.
      */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeBlock && (
          <BlockCard
            block={activeBlock}
            onToggle={async () => {}}
            onDelete={async () => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
