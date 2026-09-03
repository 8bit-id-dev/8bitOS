import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        fg: '#ffffff',
        'gray-100': '#f5f5f5',
        'gray-300': '#d4d4d4',
        'gray-500': '#737373',
        'gray-700': '#404040',
        'gray-950': '#0a0a0a',
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'system-ui'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        micro: ['10px', { lineHeight: '1' }],
        mono: ['12px', { lineHeight: '1' }],
        small: ['12px', { lineHeight: '1.4' }],
        body: ['14px', { lineHeight: '1.5' }],
        h2: ['18px', { lineHeight: '1.3' }],
        h1: ['24px', { lineHeight: '1.2' }],
        display: ['32px', { lineHeight: '1.1' }],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #ffffff',
        'pixel-sm': '2px 2px 0 0 #ffffff',
        'pixel-inset': 'inset 0 4px 0 0 #000000',
      },
      borderWidth: { DEFAULT: '2px' },
      borderStyle: { DEFAULT: 'solid' },
      spacing: {
        sidebar: '80px',
        'header-h': '64px',
        'footer-h': '40px',
      },
      minWidth: { tap: '44px' },
      minHeight: { tap: '44px' },
    },
  },
  plugins: [],
} satisfies Config;
