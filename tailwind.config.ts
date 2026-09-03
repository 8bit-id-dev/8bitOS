import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0f0a',
        'bg-raised': '#0d130d',
        fg: '#c8e6c9',
        accent: '#4af626',
        'accent-dim': '#2f9e1f',
        dim: '#5a7a5a',
        dimmer: '#374b37',
        line: '#1d2b1d',
        'line-strong': '#2f4a2f',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Cascadia Mono', 'monospace'],
        pixel: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        sans: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        micro: ['9px', { lineHeight: '1.2', letterSpacing: '0.1em' }],
        tiny: ['10px', { lineHeight: '1.3', letterSpacing: '0.06em' }],
        xs: ['11px', { lineHeight: '1.4', letterSpacing: '0.04em' }],
        small: ['12px', { lineHeight: '1.5' }],
        base: ['13px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.4', letterSpacing: '0.03em' }],
        xl: ['24px', { lineHeight: '1.3', letterSpacing: '0.04em' }],
        display: ['32px', { lineHeight: '1.2', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        glow: '0 0 6px rgba(74, 246, 38, 0.35)',
        'glow-md': '0 0 12px rgba(74, 246, 38, 0.25)',
        'glow-text': '0 0 8px rgba(74, 246, 38, 0.4)',
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
