import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Lanvip Brand Colors ──────────────────────────────────────────────
      colors: {
        brand: {
          50:  '#f5f0ff',
          100: '#ede0ff',
          200: '#d9bfff',
          300: '#be94ff',
          400: '#a162ff',
          500: '#8b3fff',  // Primary violet
          600: '#7c22f5',
          700: '#6a18d9',
          800: '#5a16b3',
          900: '#4b1590',
          950: '#2e0a5e',
        },
        surface: {
          0:   '#ffffff',
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          950: '#0a0a0a',
        },
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

      // ── Box Shadows (Diffuse, no hard edges) ─────────────────────────────
      boxShadow: {
        'lanvip-sm':  '0 4px 16px rgb(0 0 0 / 0.04)',
        'lanvip':     '0 8px 30px rgb(0 0 0 / 0.06)',
        'lanvip-lg':  '0 16px 48px rgb(0 0 0 / 0.08)',
        'lanvip-glow':'0 0 40px rgb(139 63 255 / 0.15)',
      },

      // ── Backdrop Blur ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
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
        'mesh-drift': 'mesh-drift 8s ease infinite',
        'fade-up':    'fade-up 0.5s ease forwards',
        'scale-in':   'scale-in 0.3s ease forwards',
      },

      // ── Spacing extras ────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config
