'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadUserFavicon, removeUserFavicon } from '@/services/storage'
import { useAuth } from '@/context/AuthContext'
import { usePaywall } from '@/context/PaywallContext'
import { ImageCropperModal, type CropPixels } from '@/components/profile/ImageCropperModal'

interface Props {
  currentUrl?: string
  isVip: boolean
  onUploadSuccess: (url: string) => void
  onRemoveSuccess: () => void
}

export function FaviconUploader({ currentUrl, isVip, onUploadSuccess, onRemoveSuccess }: Props) {
  const { user } = useAuth()
  const { openUpgradeModal } = usePaywall()
  const [isExpanded, setIsExpanded] = useState(false)
  
  const [isUploading, setIsUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewSrc(url)
    
    // clear input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmCrop = async (cropPixels: CropPixels) => {
    if (!user?.uid || !selectedFile) return
    
    setPreviewSrc(null)
    setIsUploading(true)
    setStatusMsg(null)
    
    try {
      const url = await uploadUserFavicon(user.uid, selectedFile, cropPixels)
      onUploadSuccess(url)
      setStatusMsg({ type: 'ok', text: '¡Favicon actualizado! La imagen anterior se ha reemplazado.' })
    } catch (err: any) {
      console.error('[FaviconUploader] upload failed:', err)
      setStatusMsg({ type: 'err', text: err.message || 'Error al optimizar/subir el favicon.' })
    } finally {
      setIsUploading(false)
      setSelectedFile(null)
    }
  }

  const handleCancelCrop = () => {
    setPreviewSrc(null)
    setSelectedFile(null)
  }

  const handleRemove = async () => {
    if (!user?.uid) return
    setIsUploading(true)
    setStatusMsg(null)
    try {
      await removeUserFavicon(user.uid)
      onRemoveSuccess()
      setStatusMsg({ type: 'ok', text: 'Favicon eliminado correctamente.' })
    } catch (err: any) {
      console.error('[FaviconUploader] remove failed:', err)
      setStatusMsg({ type: 'err', text: err.message || 'Error al eliminar el favicon.' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div className="glass-card mt-6">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#D4AF37]/10 p-2 rounded-lg">
              <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#F5F5F5' }}>
                Favicon Personalizado
                <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  VIP
                </span>
              </h2>
              <p className="text-xs text-[#A3A3A3] mt-1">
                Cambiá el ícono que aparece en la pestaña del navegador.
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-neutral-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden relative"
            >
              {!isVip && (
                <div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-black/60 rounded-xl"
                  onClick={openUpgradeModal}
                >
                  <div className="flex flex-col items-center gap-2 bg-[#111]/90 px-6 py-4 rounded-2xl border border-[#D4AF37]/30 shadow-2xl text-center max-w-[80%]">
                    <div className="bg-[#D4AF37]/20 p-2 rounded-full mb-1">
                      <svg className="w-6 h-6 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">Mejorá tu plan para tener tu propio Favicon</span>
                    <span className="text-xs text-[#A3A3A3]">Mostrá tu marca incluso en la pestaña del navegador, haciendo que tu perfil se sienta como una App independiente.</span>
                    <button type="button" className="mt-2 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#F2CD5C] px-4 py-1.5 rounded-full transition-colors">
                      Actualizar a VIP
                    </button>
                  </div>
                </div>
              )}

              <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4">
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 text-xs space-y-2">
                  <p className="font-medium text-[#F5F5F5]">¿Qué es un Favicon?</p>
                  <p className="text-[#A3A3A3]">
                    Es el pequeño logo que aparece en la pestaña de tu navegador cuando alguien visita tu sitio o cuando lo guardan en favoritos. Si usas un Favicon, reemplazará al logo de Lanvip por el tuyo.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative group w-16 h-16 rounded overflow-hidden border border-white/10 bg-[#111] flex items-center justify-center">
                      {currentUrl ? (
                        <img 
                          src={currentUrl} 
                          alt="Favicon preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                      
                      {currentUrl && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={handleRemove}
                            disabled={isUploading || !isVip}
                            className="p-2 text-red-500 hover:text-red-400 bg-red-500/10 rounded-full transition-colors backdrop-blur-sm"
                            title="Eliminar favicon"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <input 
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isUploading || !isVip}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !isVip}
                        className="btn-primary-dark py-1.5 px-4 text-xs font-semibold whitespace-nowrap bg-white/5 hover:bg-white/10 border-white/10 w-fit"
                      >
                        {isUploading ? 'Subiendo...' : (currentUrl ? 'Cambiar icono' : 'Subir icono')}
                      </button>
                      <span className="text-[10px] text-white/50 max-w-[200px]">
                        Recomendado: Imagen cuadrada de al menos 64x64px (PNG, WebP).
                      </span>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {statusMsg && (
                      <motion.div
                        key={statusMsg.text}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-xs px-3 py-2 rounded-lg border w-fit ${
                          statusMsg.type === 'ok' 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        {statusMsg.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {previewSrc && selectedFile && (
        <ImageCropperModal
          isOpen={!!previewSrc}
          imageSrc={previewSrc}
          aspectRatio={1}
          cropShape="round"
          onCancel={handleCancelCrop}
          onConfirm={handleConfirmCrop}
        />
      )}
    </>
  )
}
