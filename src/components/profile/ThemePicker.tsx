'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VIP_THEMES, matchThemeId, type VipTheme } from '@/lib/themes'
import type { ThemeSettings } from '@/types'

interface CustomThemePayload {
  id: 'custom'
  settings: ThemeSettings
}

interface ThemePickerProps {
  currentSettings: ThemeSettings
  onChange: (theme: VipTheme | CustomThemePayload) => void
  onCustomColorChange?: (key: 'background' | 'accent' | 'textColor', value: string) => void
  disabled?: boolean
}

export function ThemePicker({ 
  currentSettings, 
  onChange, 
  onCustomColorChange,
  disabled 
}: ThemePickerProps) {
  const activeId = matchThemeId(currentSettings)
  const [showAll, setShowAll] = useState(false)
  const visibleThemes = showAll ? VIP_THEMES : VIP_THEMES.slice(0, 4)

  return (
    <div className="space-y-3">
      <p className="label-dark">Temas estándar</p>
      <div className="grid grid-cols-2 gap-3">
        {visibleThemes.map((theme, i) => {
          const isActive = theme.id === activeId
          return (
            <motion.button
              key={theme.id}
              id={`theme-${theme.id}`}
              type="button"
              disabled={disabled}
              onClick={() => onChange(theme)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
              className="relative rounded-2xl overflow-hidden text-left transition-all"
              style={{
                border: isActive
                  ? `2px solid ${theme.accent}`
                  : '2px solid #333333',
                boxShadow: isActive
                  ? `0 0 20px ${theme.accent}33`
                  : 'none',
              }}
              aria-pressed={isActive}
              aria-label={`Seleccionar tema ${theme.name}`}
            >
              {/* Color swatch */}
              <div
                className="h-14 w-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.settings.colors[0]} 0%, ${theme.settings.colors[1]} 100%)`,
                }}
              >
                {/* Accent dot */}
                <div
                  className="absolute top-2 right-2 w-3 h-3 rounded-full"
                  style={{ background: theme.accent }}
                />
                {/* Active check */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ background: theme.accent, color: '#0A0A0A' }}
                  >
                    ✓
                  </motion.div>
                )}
              </div>

              {/* Theme info */}
              <div className="px-3 py-2" style={{ background: 'rgba(26,26,26,0.9)' }}>
                <p className="text-xs font-semibold" style={{ color: '#F5F5F5' }}>
                  {theme.name}
                </p>
                <p className="text-xs" style={{ color: '#A3A3A3' }}>
                  {theme.description}
                </p>
              </div>
            </motion.button>
          )
        })}

        {!showAll && (
          <motion.button
            type="button"
            className="col-span-2 py-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2"
            style={{ color: '#A3A3A3', background: 'rgba(26,26,26,0.5)', border: '1px solid #333' }}
            onClick={() => setShowAll(true)}
            whileTap={{ scale: 0.98 }}
          >
            Ver más temas (VIP) ⬇️
          </motion.button>
        )}

        {/* Custom Theme Button */}
        {(() => {
          const isActive = activeId === 'custom'
          const customBg = currentSettings.customColors?.background ?? '#0a0a0a'
          const customAccent = currentSettings.customColors?.accent ?? '#D4AF37'
          const customText = currentSettings.customColors?.textColor ?? '#ffffff'
          
          return (
            <motion.div className="col-span-2 space-y-3 mt-2">
              <motion.button
                key="custom"
                id="theme-custom"
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!isActive) {
                    onChange({
                      id: 'custom',
                      settings: {
                        ...currentSettings,
                        themeId: 'custom',
                        customColors: {
                          background: customBg,
                          accent: customAccent,
                          textColor: customText
                        }
                      }
                    })
                  }
                }}
                whileTap={{ scale: 0.95 }}
                className="relative rounded-2xl overflow-hidden text-left transition-all w-full"
                style={{
                  border: isActive
                    ? `2px solid ${customAccent}`
                    : '2px solid #333333',
                  boxShadow: isActive
                    ? `0 0 20px ${customAccent}33`
                    : 'none',
                }}
              >
                <div
                  className="h-14 w-full"
                  style={{ background: customBg }}
                >
                  <div
                    className="absolute top-2 right-2 w-3 h-3 rounded-full"
                    style={{ background: customAccent }}
                  />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{ background: customAccent, color: '#0A0A0A' }}
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
                <div className="px-3 py-2" style={{ background: 'rgba(26,26,26,0.9)' }}>
                  <p className="text-xs font-semibold" style={{ color: '#F5F5F5' }}>Personalizado</p>
                  <p className="text-xs" style={{ color: '#A3A3A3' }}>Crea tu propia identidad visual</p>
                </div>
              </motion.button>
              
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border overflow-hidden"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.06)', 
                      background: 'rgba(26,26,26,0.5)' 
                    }}
                  >
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>Color de Fondo</label>
                      <input 
                        type="color" 
                        value={customBg}
                        disabled={disabled}
                        onChange={e => onCustomColorChange?.('background', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border-0 p-0"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>Color de Acento</label>
                      <input 
                        type="color" 
                        value={customAccent}
                        disabled={disabled}
                        onChange={e => onCustomColorChange?.('accent', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border-0 p-0"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>Color de Texto</label>
                      <input 
                        type="color" 
                        value={customText}
                        disabled={disabled}
                        onChange={e => onCustomColorChange?.('textColor', e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border-0 p-0"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })()}
      </div>
    </div>
  )
}
