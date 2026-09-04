import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050505',
        surface: '#111111',
        fg: '#ffffff',
        'gray-300': '#aaaaaa',
        'gray-500': '#777777',
        line: '#222222',
        'line-strong': '#333333',
      },
      fontFamily: {
        // Identity font: logo/menu/heading/label/button (Doc 05 v2 §4)
        pixel: ['"Pixelify Sans"', 'system-ui', 'monospace'],
        // Reading font: body/materi/soal/catatan (Doc 05 v2 §4)
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        micro: ['10px', { lineHeight: '1.2', letterSpacing: '0.1em' }],
        'pixel-xs': ['11px', { lineHeight: '1.3', letterSpacing: '0.06em' }],
        'pixel-sm': ['12px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        small: ['13px', { lineHeight: '1.6' }],
        body: ['15px', { lineHeight: '1.6' }],
        'pixel-md': ['16px', { lineHeight: '1.5' }],
        'pixel-lg': ['20px', { lineHeight: '1.5', letterSpacing: '0.04em' }],
        'pixel-xl': ['24px', { lineHeight: '1.4', letterSpacing: '0.03em' }],
        display: ['42px', { lineHeight: '1.2', letterSpacing: '0.02em' }],
      },
      boxShadow: {
        pixel: '3px 3px 0 0 #ffffff',
        'pixel-sm': '2px 2px 0 0 #ffffff',
      },
      borderWidth: { DEFAULT: '1px' },
      spacing: {
        sidebar: '64px',
        'header-h': '48px',
        'footer-h': '28px',
      },
      minWidth: { tap: '44px' },
      minHeight: { tap: '44px' },
    },
  },
  plugins: [],
} satisfies Config;
