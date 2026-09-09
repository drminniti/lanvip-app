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
  {
    id:          'crimson',
    name:        'Crimson Velvet',
    description: 'Fondo rojo muy oscuro, Acento dorado',
    accent:      '#D4AF37',
    settings: {
      bgType:    'mesh',
      colors:    ['#200508', '#380B12'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'ocean',
    name:        'Ocean Deep',
    description: 'Fondo azul marino, Acento cyan',
    accent:      '#00FFFF',
    settings: {
      bgType:    'mesh',
      colors:    ['#011126', '#03234F'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'amethyst',
    name:        'Amethyst',
    description: 'Fondo púrpura oscuro, Acento lila',
    accent:      '#C8A2C8',
    settings: {
      bgType:    'mesh',
      colors:    ['#160824', '#2D1248'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'silver',
    name:        'Silver Lining',
    description: 'Fondo gris grafito, Acento plata/blanco',
    accent:      '#E0E0E0',
    settings: {
      bgType:    'mesh',
      colors:    ['#1A1A1A', '#2D2D2D'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'cyberpunk',
    name:        'Cyber Punk',
    description: 'Fondo negro, Acento verde neón',
    accent:      '#39FF14',
    settings: {
      bgType:    'mesh',
      colors:    ['#050505', '#111111'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'desert',
    name:        'Desert Sand',
    description: 'Fondo arena/beige oscuro, Acento terracota',
    accent:      '#E2725B',
    settings: {
      bgType:    'mesh',
      colors:    ['#3B2F2F', '#52433D'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'sapphire',
    name:        'Royal Sapphire',
    description: 'Fondo azul zafiro, Acento oro rosa',
    accent:      '#B76E79',
    settings: {
      bgType:    'mesh',
      colors:    ['#07142E', '#0F2C61'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'copper',
    name:        'Copper Glow',
    description: 'Fondo carbón, Acento cobre/naranja',
    accent:      '#B87333',
    settings: {
      bgType:    'mesh',
      colors:    ['#1C1C1C', '#282828'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'arctic',
    name:        'Arctic Ice',
    description: 'Fondo gris muy claro, Acento azul hielo',
    accent:      '#99FFFF',
    settings: {
      bgType:    'mesh',
      colors:    ['#E0E5EC', '#F0F5FA'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'matcha',
    name:        'Matcha',
    description: 'Fondo verde oscuro, Acento verde té',
    accent:      '#C5E1A5',
    settings: {
      bgType:    'mesh',
      colors:    ['#182A1B', '#2C4A31'],
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
