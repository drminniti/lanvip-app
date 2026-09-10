// ─── VIP Theme Definitions ────────────────────────────────────────────────────
// 4 curated themes per 0_Brand.md — no free picker (quality control)

import type { ThemeSettings } from '@/types'

export interface VipTheme {
  id:          string
  name:        string
  description: string
  accent:      string
  textColor:   string
  settings:    ThemeSettings
}

export interface ThemeCategory {
  name: string
  themeIds: string[]
}

export const THEME_CATEGORIES: ThemeCategory[] = [
  {
    name: 'Esenciales',
    themeIds: ['obsidian', 'midnight', 'forest', 'rose']
  },
  {
    name: 'Cyber & Neon',
    themeIds: ['cyberpunk', 'ocean', 'neon_matrix', 'synthwave']
  },
  {
    name: 'Organic & Earth',
    themeIds: ['desert', 'matcha', 'terracotta', 'deep_moss']
  },
  {
    name: 'Minimal Luxury',
    themeIds: ['silver', 'crimson', 'sapphire', 'copper']
  },
  {
    name: 'Dynamic & Avant-Garde',
    themeIds: ['aurora', 'cyber_grid', 'floating_orbs', 'bauhaus']
  }
]

export const VIP_THEMES: VipTheme[] = [
  // ── Esenciales ──
  {
    id:          'obsidian',
    name:        'Obsidian',
    description: 'Negro puro con dorado VIP',
    accent:      '#D4AF37',
    textColor:   '#F0F0F0',
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
    textColor:   '#F0F0F0',
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
    textColor:   '#E8F5E9',
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
    textColor:   '#FDF0F3',
    settings: {
      bgType:    'mesh',
      colors:    ['#1A0A0F', '#250E16'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },

  // ── Cyber & Neon ──
  {
    id:          'cyberpunk',
    name:        'Cyber Punk',
    description: 'Fondo negro, Acento verde neón',
    accent:      '#39FF14',
    textColor:   '#FFFFFF',
    settings: {
      bgType:    'mesh',
      colors:    ['#050505', '#111111'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'ocean',
    name:        'Ocean Deep',
    description: 'Fondo azul marino, Acento cyan',
    accent:      '#00FFFF',
    textColor:   '#E0F2FE',
    settings: {
      bgType:    'mesh',
      colors:    ['#011126', '#03234F'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'neon_matrix',
    name:        'Neon Matrix',
    description: 'Casi negro con verde flúor',
    accent:      '#00FF41',
    textColor:   '#E8F5E9',
    settings: {
      bgType:    'mesh',
      colors:    ['#0A0F0D', '#031408'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'synthwave',
    name:        'Synthwave',
    description: 'Violeta oscuro con fucsia',
    accent:      '#FF00FF',
    textColor:   '#F3E5F5',
    settings: {
      bgType:    'mesh',
      colors:    ['#1A0524', '#2D0A3D'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },

  // ── Organic & Earth ──
  {
    id:          'desert',
    name:        'Desert Sand',
    description: 'Fondo arena oscuro, Acento terracota',
    accent:      '#E2725B',
    textColor:   '#FAFAFA',
    settings: {
      bgType:    'mesh',
      colors:    ['#3B2F2F', '#52433D'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'matcha',
    name:        'Matcha',
    description: 'Verde oscuro, Acento verde té',
    accent:      '#C5E1A5',
    textColor:   '#F1F8E9',
    settings: {
      bgType:    'mesh',
      colors:    ['#182A1B', '#2C4A31'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'terracotta',
    name:        'Terracotta Clay',
    description: 'Arcilla oscura, Acento naranja quemado',
    accent:      '#D84315',
    textColor:   '#FBE9E7',
    settings: {
      bgType:    'mesh',
      colors:    ['#4E342E', '#3E2723'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'deep_moss',
    name:        'Deep Moss',
    description: 'Marrón oscuro, Acento musgo',
    accent:      '#8BC34A',
    textColor:   '#F1F8E9',
    settings: {
      bgType:    'mesh',
      colors:    ['#263238', '#1C2529'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },

  // ── Minimal Luxury ──
  {
    id:          'silver',
    name:        'Silver Lining',
    description: 'Gris grafito, Plata y Blanco',
    accent:      '#E0E0E0',
    textColor:   '#FFFFFF',
    settings: {
      bgType:    'mesh',
      colors:    ['#1A1A1A', '#2D2D2D'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'crimson',
    name:        'Crimson Velvet',
    description: 'Rojo muy oscuro, Dorado',
    accent:      '#D4AF37',
    textColor:   '#FFF5F5',
    settings: {
      bgType:    'mesh',
      colors:    ['#200508', '#380B12'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'sapphire',
    name:        'Royal Sapphire',
    description: 'Azul zafiro, Oro rosa',
    accent:      '#B76E79',
    textColor:   '#E8EAF6',
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
    description: 'Carbón y Cobre',
    accent:      '#B87333',
    textColor:   '#F5F5F5',
    settings: {
      bgType:    'mesh',
      colors:    ['#1C1C1C', '#282828'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },

  // ── Dynamic & Avant-Garde ──
  {
    id:          'aurora',
    name:        'Aurora Flow',
    description: 'Movimiento radial y colores nórdicos',
    accent:      '#FF00FF',
    textColor:   '#F3E5F5',
    settings: {
      bgType:    'mesh',
      bgEffect:  'aurora',
      colors:    ['#050510', '#100520'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'cyber_grid',
    name:        'Cyber Grid',
    description: 'Grilla animada infinita',
    accent:      '#00FFFF',
    textColor:   '#E0F2FE',
    settings: {
      bgType:    'mesh',
      bgEffect:  'grid-motion',
      colors:    ['#020205', '#0A0A15'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'floating_orbs',
    name:        'Floating Orbs',
    description: 'Esferas levitantes orgánicas',
    accent:      '#2196F3',
    textColor:   '#FFFFFF',
    settings: {
      bgType:    'mesh',
      bgEffect:  'floating-orbs',
      colors:    ['#0A192F', '#020C1B'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'bauhaus',
    name:        'Bauhaus Shapes',
    description: 'Geometría y colores sofisticados',
    accent:      '#FF9800',
    textColor:   '#F5F5F5',
    settings: {
      bgType:    'mesh',
      bgEffect:  'bauhaus-shapes',
      colors:    ['#121212', '#1A1A1A'],
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
