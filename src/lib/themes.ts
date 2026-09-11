// ─── VIP Theme Definitions ────────────────────────────────────────────────────
// 4 curated themes per 0_Brand.md — no free picker (quality control)

import type { ThemeSettings } from '@/types'

export interface VipTheme {
  id:          string
  name:        string
  description: string
  accent:      string
  textColor:   string
  isPremium:   boolean
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
  },
  {
    name: 'Clean & Pro',
    themeIds: ['pure_snow', 'corporate_slate', 'warm_vanilla', 'geometric_trust']
  },
  {
    name: 'Creator & Pop',
    themeIds: ['bubblegum', 'y2k_dream', 'sunset_vibe', 'kinetic_pop']
  },
  {
    name: 'Dev & Studio',
    themeIds: ['terminal_matrix', 'monokai', 'noir_gallery', 'cyber_canvas']
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
    isPremium:   false,
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
    isPremium:   false,
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
    isPremium:   false,
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
    isPremium:   false,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
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
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'bauhaus-shapes',
      colors:    ['#121212', '#1A1A1A'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },

  // ── Clean & Pro ──
  {
    id:          'pure_snow',
    name:        'Pure Snow',
    description: 'Blanco puro, minimalismo corporativo',
    accent:      '#475569',
    textColor:   '#0F172A',
    isPremium:   true,
    settings: {
      bgType:    'solid',
      colors:    ['#FFFFFF'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'corporate_slate',
    name:        'Corporate Slate',
    description: 'Gris hielo dinámico con esferas',
    accent:      '#2563EB',
    textColor:   '#1E293B',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'floating-orbs',
      colors:    ['#F1F5F9', '#E2E8F0'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'warm_vanilla',
    name:        'Warm Vanilla',
    description: 'Crema suave, calidez elegante',
    accent:      '#D97757',
    textColor:   '#292524',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      colors:    ['#FFFBF0', '#F5F0E6'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'geometric_trust',
    name:        'Geometric Trust',
    description: 'Geometría sutil sobre perla',
    accent:      '#059669',
    textColor:   '#064E3B',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'bauhaus-shapes',
      colors:    ['#F8FAFC', '#F1F5F9'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },

  // ── Creator & Pop ──
  {
    id:          'bubblegum',
    name:        'Bubblegum',
    description: 'Rosa chicle y energía vibrante',
    accent:      '#DB2777',
    textColor:   '#4A044E',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      colors:    ['#FDF2F8', '#FCE7F3'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'y2k_dream',
    name:        'Y2K Dream',
    description: 'Lavanda con mesh gradient cian',
    accent:      '#06B6D4',
    textColor:   '#312E81',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'aurora',
      colors:    ['#E0E7FF', '#C7D2FE'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'sunset_vibe',
    name:        'Sunset Vibe',
    description: 'Degradado naranja a durazno',
    accent:      '#FCD34D',
    textColor:   '#451A03',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      colors:    ['#FFEDD5', '#FED7AA'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'kinetic_pop',
    name:        'Kinetic Pop',
    description: 'Púrpura vibrante geométrico',
    accent:      '#FBBF24',
    textColor:   '#F3F4F6',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'bauhaus-shapes',
      colors:    ['#6D28D9', '#5B21B6'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },

  // ── Dev & Studio ──
  {
    id:          'terminal_matrix',
    name:        'Terminal Matrix',
    description: 'Negro absoluto, grilla animada',
    accent:      '#10B981',
    textColor:   '#10B981',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'grid-motion',
      colors:    ['#000000', '#050505'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'monokai',
    name:        'Monokai',
    description: 'Gris puro, acento neón',
    accent:      '#F43F5E',
    textColor:   '#F1F5F9',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      colors:    ['#1E1E1E', '#2D2D2D'],
      cardStyle: 'glass',
      darkMode:  true,
    },
  },
  {
    id:          'noir_gallery',
    name:        'Noir Gallery',
    description: 'Blanco y negro radical',
    accent:      '#171717',
    textColor:   '#000000',
    isPremium:   true,
    settings: {
      bgType:    'solid',
      colors:    ['#FFFFFF'],
      cardStyle: 'glass',
      darkMode:  false,
    },
  },
  {
    id:          'cyber_canvas',
    name:        'Cyber Canvas',
    description: 'Azul noche con esferas levitantes',
    accent:      '#F97316',
    textColor:   '#F8FAFC',
    isPremium:   true,
    settings: {
      bgType:    'mesh',
      bgEffect:  'floating-orbs',
      colors:    ['#0F172A', '#020617'],
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
