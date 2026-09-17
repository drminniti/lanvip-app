'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Block } from '@/types'

interface ImageGalleryBlockProps {
  block: Block
  accent: string
}

export function ImageGalleryBlock({ block, accent }: ImageGalleryBlockProps) {
  const images = block.content.galleryImages || []
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const isButtonMode = block.content.displayMode === 'button'
  const isFeatured = block.isFeatured
  const tileColor = isFeatured ? accent : 'rgba(255,255,255,0.4)'

  const carouselView = (
    <div 
      className="w-full flex flex-col items-center justify-center p-5 rounded-[2rem] overflow-hidden group transition-all relative"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: isFeatured ? `1px solid ${accent}73` : '1px solid rgba(255,255,255,0.05)',
        boxShadow: isFeatured ? `0 0 12px ${accent}26` : 'none',
      }}
    >
      {isFeatured && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
            boxShadow: `inset 0 0 20px ${accent}22`,
            pointerEvents: 'none', zIndex: 1,
          }}
        />
      )}
      {block.content.title && (
        <div className="w-full mb-4 flex items-center gap-2 relative z-10">
          <span className="text-xl">📸</span>
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: accent }}>
            {block.content.title}
          </h3>
        </div>
      )}
      
      {images.length === 0 ? (
        <p className="text-xs text-center relative z-10" style={{ color: '#888' }}>No hay imágenes en esta galería.</p>
      ) : (
        <div 
          className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide relative z-10"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          }}
        >
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className="relative flex-none w-[85%] sm:w-[280px] aspect-[4/3] overflow-hidden rounded-xl cursor-pointer shadow-sm snap-center"
              onClick={() => setSelectedImageIndex(index)}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all z-10 pointer-events-none" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const buttonView = (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => setSelectedImageIndex(0)}
      className="w-full bento-tile flex items-center gap-3 px-4 py-4"
      style={{ 
        textDecoration: 'none', 
        borderColor: `${tileColor}35`,
        boxShadow: isFeatured ? `0 0 12px ${accent}26` : 'none',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        borderWidth: '1px',
        borderStyle: 'solid',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.span
        aria-hidden="true"
        initial={{ opacity: isFeatured ? 0.55 : 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '65%', height: '140%',
          background: `radial-gradient(circle, ${tileColor}28 0%, transparent 70%)`,
          filter: 'blur(18px)', pointerEvents: 'none', zIndex: 0,
        }}
      />
      <span className="text-xl flex-shrink-0 leading-none" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}>
        📸
      </span>
      {block.content.title && (
        <div className="flex-1 min-w-0" style={{ position: 'relative', zIndex: 1 }}>
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--theme-text, #F0F0F0)' }}>
            {block.content.title}
          </p>
        </div>
      )}
    </motion.button>
  )

  return (
    <>
      {isButtonMode ? buttonView : carouselView}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50">
              <span className="text-sm font-medium" style={{ color: '#888' }}>
                {selectedImageIndex + 1} / {images.length}
              </span>
              <button 
                onClick={() => setSelectedImageIndex(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                aria-label="Cerrar galería"
              >
                ✕
              </button>
            </div>

            {/* Navigation Areas */}
            <div 
              className="absolute left-0 top-1/2 bottom-0 w-1/3 z-40 cursor-w-resize flex items-center px-4"
              onClick={() => setSelectedImageIndex((prev) => prev !== null ? (prev === 0 ? images.length - 1 : prev - 1) : null)}
            >
              <div className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur opacity-0 hover:opacity-100 transition-opacity">
                ←
              </div>
            </div>
            <div 
              className="absolute right-0 top-1/2 bottom-0 w-1/3 z-40 cursor-e-resize flex items-center justify-end px-4"
              onClick={() => setSelectedImageIndex((prev) => prev !== null ? (prev === images.length - 1 ? 0 : prev + 1) : null)}
            >
              <div className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur opacity-0 hover:opacity-100 transition-opacity">
                →
              </div>
            </div>

            {/* Main Image */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full max-w-5xl max-h-[85vh] p-4 flex items-center justify-center relative z-30 pointer-events-none"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={images[selectedImageIndex].url}
                alt="Imagen ampliada"
                className="max-w-full max-h-full object-contain pointer-events-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
