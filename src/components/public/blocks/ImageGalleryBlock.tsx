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

  // Split images into columns for masonry layout
  // 2 columns on mobile, 3 on larger screens (handled by css columns)
  
  return (
    <>
      <div 
        className="w-full flex flex-col items-center justify-center p-5 rounded-[2rem] overflow-hidden group transition-all relative"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="w-full mb-4 flex items-center gap-2">
          <span className="text-xl">📸</span>
          <h3 className="text-sm font-semibold tracking-wide uppercase" style={{ color: accent }}>
            {block.content.title || 'Galería VIP'}
          </h3>
        </div>
        
        {images.length === 0 ? (
          <p className="text-xs text-center" style={{ color: '#888' }}>No hay imágenes en esta galería.</p>
        ) : (
          <div className="w-full columns-2 gap-2 space-y-2">
            {images.map((img, index) => (
              <div 
                key={img.id} 
                className="relative w-full overflow-hidden rounded-xl cursor-pointer break-inside-avoid shadow-sm"
                onClick={() => setSelectedImageIndex(index)}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all z-10 pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img.url} 
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
