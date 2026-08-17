import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Dark mode is the ONLY mode — no class toggle needed
  theme: {
    extend: {
      // ── Lanvip Dark Premium Palette (0_Brand.md §3) ──────────────────────
      colors: {
        // Application background
        bg: '#0A0A0A',
        // Bento box surfaces / glassmorphism base
        surface: '#1A1A1A',
        // Card & separator borders
        border: '#333333',
        // Text
        'text-primary':   '#F5F5F5',
        'text-secondary': '#A3A3A3',
        // Accent CTA — Gold VIP (0_Brand.md §3)
        accent: {
          DEFAULT: '#D4AF37',
          hover:   '#B8962E',
          subtle:  'rgba(212,175,55,0.12)',
        },
        // Kept for any one-off overrides
        white: '#ffffff',
        black: '#000000',
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },

      // ── Border Radius (Squircles) ─────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ── Box Shadows — diffuse, no hard edges (0_Brand.md §4) ─────────────
      boxShadow: {
        'lanvip':      '0 8px 30px rgb(0 0 0 / 0.40)',
        'lanvip-sm':   '0 4px 16px rgb(0 0 0 / 0.30)',
        'lanvip-lg':   '0 16px 48px rgb(0 0 0 / 0.50)',
        'accent-glow': '0 0 32px rgba(212,175,55,0.25)',
      },

      // ── Animations ────────────────────────────────────────────────────────
      keyframes: {
        'mesh-drift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'mesh-drift': 'mesh-drift 10s ease infinite',
        'fade-up':    'fade-up 0.5s ease forwards',
        'scale-in':   'scale-in 0.3s ease forwards',
      },

      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config
