/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        // 'roboto-slab': ['"Roboto Slab"'],
        // 'roboto-condensed': ['"Roboto Condensed"'],
        // 'roboto-flex': ['"Roboto Flex"'],

        'akrobat': ['"Akrobat"'],
        'roboto': ['"Roboto"'],
      },
      colors: {
        'ferm-gray': {
          DEFAULT: '#F4F4F4',
        },
        'ferm-black': {
          DEFAULT: '##1D1D1B',
        },
        'ferm-red': {
          light: '#E5243B',
          dark: '#C5192D',
        },
        'ferm-blue': {
          light: '#26BDE2',
          dark: '#0A97D9',
        },
        'ferm-green': {
          light: '#56C02B',
          dark: '#3F7E44',
        },
        'ferm-mustard': {
          light: '#DDA63A',
          dark: '#BF8B2E',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
  darkMode: 'class',
}
