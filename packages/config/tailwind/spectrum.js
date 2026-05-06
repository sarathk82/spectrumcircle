/** @type {import('tailwindcss').Config['theme']} */
const spectrumTheme = {
  colors: {
    primary: {
      50:  '#eeebfc',
      100: '#d5cffa',
      200: '#b3abf5',
      300: '#8e85ef',
      400: '#7468e9',
      500: '#5B4FCF',
      600: '#4f45b9',
      700: '#41399e',
      800: '#342e83',
      900: '#232065',
      DEFAULT: '#5B4FCF',
      foreground: '#FFFFFF',
    },
    secondary: {
      50:  '#e8f4fd',
      100: '#c8e5fb',
      200: '#97ccf7',
      300: '#62b2f2',
      400: '#3f9feb',
      500: '#4BADE8',
      600: '#3292cc',
      700: '#2475a8',
      800: '#185987',
      900: '#0d3e63',
      DEFAULT: '#4BADE8',
      foreground: '#FFFFFF',
    },
    accent: {
      DEFAULT: '#F7A349',
      foreground: '#1A1A2E',
    },
    background: '#F8F7FF',
    surface: '#FFFFFF',
    text: {
      DEFAULT: '#1A1A2E',
      muted: '#6B7280',
      light: '#9CA3AF',
    },
    spectrum: {
      red:    '#FF5A5A',
      orange: '#FF9A3C',
      yellow: '#FFD23F',
      green:  '#4CAF7D',
      blue:   '#4BADE8',
      purple: '#9B59B6',
    },
    border: '#E5E7EB',
    destructive: {
      DEFAULT: '#EF4444',
      foreground: '#FFFFFF',
    },
  },
};

module.exports = { spectrumTheme };
