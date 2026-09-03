import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        fg: '#ffffff',
        'gray-100': '#f5f5f5',
        'gray-300': '#d4d4d4',
        'gray-500': '#737373',
        'gray-700': '#404040',
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'system-ui'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0 0 #ffffff',
        'pixel-sm': '2px 2px 0 0 #ffffff',
      },
      borderWidth: { DEFAULT: '2px' },
    },
  },
  plugins: [],
} satisfies Config;