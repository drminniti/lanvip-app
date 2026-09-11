'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { THEME_CATEGORIES, getThemeById, matchThemeId, type VipTheme } from '@/lib/themes'
import type { ThemeSettings } from '@/types'
import { useSubscription } from '@/hooks/useSubscription'
import { usePaywall } from '@/context/PaywallContext'

interface CustomThemePayload {
  id: 'custom'
  settings: ThemeSettings
}

interface ThemePickerProps {
  currentSettings: ThemeSettings
  onChange: (theme: VipTheme | CustomThemePayload) => void
  onCustomColorChange?: (updates: Partial<NonNullable<ThemeSettings['customColors']>>) => void
  disabled?: boolean
}

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (c: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer opacity-90 hover:opacity-100'} transition-opacity`}>
      <div className={`relative w-8 h-4 rounded-full transition-colors ${checked ? 'bg-[#D4AF37]' : 'bg-[#333333]'}`}>
        <motion.div 
          className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
          initial={false}
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color: '#F5F5F5' }}>{label}</span>
      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
    </label>
  )
}

export function ThemePicker({ 
  currentSettings, 
  onChange, 
  onCustomColorChange,
  disabled 
}: ThemePickerProps) {
  const activeId = matchThemeId(currentSettings)
  const { isVip } = useSubscription()
  const { openUpgradeModal } = usePaywall()
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'Esenciales': true,
  })

  function toggleCat(catName: string) {
    setExpandedCats(prev => ({ ...prev, [catName]: !prev[catName] }))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {THEME_CATEGORIES.map(cat => {
          const isExpanded = expandedCats[cat.name]
          return (
            <div key={cat.name} className="space-y-2 rounded-2xl p-2 transition-colors" style={{ background: 'rgba(26,26,26,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
              <button
                type="button"
                onClick={() => toggleCat(cat.name)}
                className="flex items-center justify-between w-full px-2 py-1 rounded-xl"
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#A3A3A3' }}>{cat.name}</span>
                <motion.svg
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  className="w-4 h-4 text-neutral-400"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {cat.themeIds.map((id, i) => {
                        const theme = getThemeById(id)
                        if (!theme) return null
                        const isActive = theme.id === activeId
                        return (
                          <motion.button
                            key={theme.id}
                            id={`theme-${theme.id}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (theme.isPremium && !isVip) {
                                openUpgradeModal()
                              } else {
                                onChange(theme)
                              }
                            }}
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
                                  className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-xs z-10"
                                  style={{ background: theme.accent, color: '#0A0A0A' }}
                                >
                                  ✓
                                </motion.div>
                              )}
                              {/* Lock Icon for non-VIP */}
                              {theme.isPremium && !isVip && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                </div>
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
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

        {/* Custom Theme Button */}
        {(() => {
          const isActive = activeId === 'custom'
          const customBg = currentSettings.customColors?.background ?? '#0a0a0a'
          const customAccent = currentSettings.customColors?.accent ?? '#D4AF37'
          const customText = currentSettings.customColors?.textColor ?? '#ffffff'
          const useGradient = currentSettings.customColors?.useGradient ?? false
          const gradientColor = currentSettings.customColors?.gradientColor ?? '#1a1a1a'
          const useTexture = currentSettings.customColors?.useTexture ?? false
          const autoContrast = currentSettings.customColors?.autoContrast ?? true
          
          return (
            <motion.div className="col-span-2 space-y-3 mt-2">
              <motion.button
                key="custom"
                id="theme-custom"
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!isVip) {
                    openUpgradeModal()
                    return
                  }
                  if (!isActive) {
                    onChange({
                      id: 'custom',
                      settings: {
                        ...currentSettings,
                        themeId: 'custom',
                        customColors: {
                          background: customBg,
                          accent: customAccent,
                          textColor: customText,
                          useGradient,
                          gradientColor,
                          useTexture,
                          autoContrast
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
                  {/* Lock Icon for non-VIP Custom Theme */}
                  {!isVip && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
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
                    className="flex flex-col gap-5 p-5 rounded-2xl border overflow-hidden"
                    style={{ 
                      borderColor: 'rgba(255,255,255,0.06)', 
                      background: 'rgba(26,26,26,0.5)' 
                    }}
                  >
                    {/* Toggles */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                      <Toggle 
                        checked={useGradient} 
                        onChange={v => onCustomColorChange?.({ useGradient: v })} 
                        label="Activar Degradado" 
                        disabled={disabled}
                      />
                      <Toggle 
                        checked={useTexture} 
                        onChange={v => onCustomColorChange?.({ useTexture: v })} 
                        label="Textura Noise" 
                        disabled={disabled}
                      />
                      <Toggle 
                        checked={autoContrast} 
                        onChange={v => onCustomColorChange?.({ autoContrast: v })} 
                        label="Contraste Auto" 
                        disabled={disabled}
                      />
                    </div>

                    {/* Colors */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>{useGradient ? 'Fondo 1' : 'Color de Fondo'}</label>
                        <input 
                          type="color" 
                          value={customBg}
                          disabled={disabled}
                          onChange={e => onCustomColorChange?.({ background: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer border-0 p-0"
                        />
                      </div>
                      
                      {useGradient && (
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>Fondo 2</label>
                          <input 
                            type="color" 
                            value={gradientColor}
                            disabled={disabled}
                            onChange={e => onCustomColorChange?.({ gradientColor: e.target.value })}
                            className="w-full h-10 rounded cursor-pointer border-0 p-0"
                          />
                        </div>
                      )}

                      <div className="flex-1 w-full space-y-1">
                        <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>Acento VIP</label>
                        <input 
                          type="color" 
                          value={customAccent}
                          disabled={disabled}
                          onChange={e => onCustomColorChange?.({ accent: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer border-0 p-0"
                        />
                      </div>

                      {!autoContrast && (
                        <div className="flex-1 w-full space-y-1">
                          <label className="text-xs font-semibold block" style={{ color: '#F5F5F5' }}>Color de Texto</label>
                          <input 
                            type="color" 
                            value={customText}
                            disabled={disabled}
                            onChange={e => onCustomColorChange?.({ textColor: e.target.value })}
                            className="w-full h-10 rounded cursor-pointer border-0 p-0"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })()}
    </div>
  )
}
