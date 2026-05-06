/** @type {import('tailwindcss').Config} */
const { spectrumTheme } = require('../../packages/config/tailwind/spectrum')

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      ...spectrumTheme,
      fontFamily: {
        nunito: ['Nunito_700Bold'],
        inter:  ['Inter_400Regular'],
      },
    },
  },
  plugins: [],
}
