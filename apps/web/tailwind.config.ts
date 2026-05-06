import type { Config } from 'tailwindcss'
const { spectrumTheme } = require('../../packages/config/tailwind/spectrum')

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      ...spectrumTheme,
      fontFamily: {
        nunito: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
        inter:  ['var(--font-inter)',  'Inter',  'sans-serif'],
        sans:   ['var(--font-inter)',  'Inter',  'sans-serif'],
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:   '0 2px 8px rgba(91,79,207,0.08)',
        'card-hover': '0 8px 24px rgba(91,79,207,0.14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
