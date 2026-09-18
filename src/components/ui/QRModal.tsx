'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'

interface QRModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  username: string
}

export function QRModal({ isOpen, onClose, url, username }: QRModalProps) {
  const qrRef = useRef<HTMLCanvasElement>(null)

  const downloadQR = () => {
    if (!qrRef.current) return
    const canvas = qrRef.current
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    
    let downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `lanvip-qr-${username}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-2xl"
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-1">Tu Código QR</h3>
              <p className="text-sm text-neutral-400">
                Escanéalo para visitar tu Micro-Landing VIP
              </p>
            </div>

            {/* QR Code Container with white background for scanning reliability */}
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-inner">
              <QRCodeCanvas
                id="qr-canvas"
                ref={qrRef}
                value={url}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"} // High error correction level for better scanning
                includeMargin={false}
              />
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQR}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all hover:brightness-110"
              style={{
                background: '#D4AF37',
                color: '#000000',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Imagen
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
