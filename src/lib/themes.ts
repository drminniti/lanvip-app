// ─── VIP Theme Definitions ────────────────────────────────────────────────────
// 4 curated themes per 0_Brand.md — no free picker (quality control)

import type { ThemeSettings } from '@/types'

export interface VipTheme {
  id:          string
  name:        string
  description: string
  accent:      string
  settings:    ThemeSettings
}

export const VIP_THEMES: VipTheme[] = [
  {
    id:          'obsidian',
    name:        'Obsidian',
    description: 'Negro puro con dorado VIP',
    accent:      '#D4AF37',
    settings: {
      bgType:    'mesh',
      colors:    ['#0A0A0A', '#141208'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'midnight',
    name:        'Midnight Blue',
    description: 'Azul profundo con acento eléctrico',
    accent:      '#4A9EFF',
    settings: {
      bgType:    'mesh',
      colors:    ['#070B14', '#0D1426'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'forest',
    name:        'Forest',
    description: 'Verde esmeralda y misterio',
    accent:      '#4CAF72',
    settings: {
      bgType:    'mesh',
      colors:    ['#081A0E', '#0E2415'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'rose',
    name:        'Rose Gold',
    description: 'Calor rosado con lujo atemporal',
    accent:      '#E8959B',
    settings: {
      bgType:    'mesh',
      colors:    ['#1A0A0F', '#250E16'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
]

export function getThemeById(id: string): VipTheme | undefined {
  return VIP_THEMES.find(t => t.id === id)
}

/** Derives a theme ID from stored ThemeSettings (for highlighting selected) */
export function matchThemeId(settings: ThemeSettings): string {
  if (settings.themeId) return settings.themeId
  return (
    VIP_THEMES.find(
      t => t.settings.colors[0] === settings.colors[0],
    )?.id ?? 'obsidian'
  )
}
