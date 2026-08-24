'use client'

import { motion } from 'framer-motion'
import { VIP_THEMES, matchThemeId, type VipTheme } from '@/lib/themes'
import type { ThemeSettings } from '@/types'

interface ThemePickerProps {
  currentSettings: ThemeSettings
  onChange: (theme: VipTheme) => void
  disabled?: boolean
}

export function ThemePicker({ currentSettings, onChange, disabled }: ThemePickerProps) {
  const activeId = matchThemeId(currentSettings)

  return (
    <div className="space-y-3">
      <p className="label-dark">Tema VIP</p>
      <div className="grid grid-cols-2 gap-3">
        {VIP_THEMES.map((theme, i) => {
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
      </div>
    </div>
  )
}
