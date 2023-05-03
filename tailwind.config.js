/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', ...defaultTheme.fontFamily.sans],
        'akrobat': ['"Akrobat"'],
        'roboto': ['"Roboto"'],
      },
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
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
  plugins: [
    require('@tailwindcss/forms'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    }),
  ],
  darkMode: 'class',
}
