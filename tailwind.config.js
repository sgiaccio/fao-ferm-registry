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
        'ferm-blue-light': {
          50: "#EDF9FD",
          100: "#D7F3FA",
          200: "#AAE5F4",
          300: "#74D4EC",
          400: "#26BDE2",
          DEFAULT: "#26BDE2",
          500: "#1CAFD3",
          600: "#199CBD",
          700: "#168AA6",
          800: "#13738B",
          900: "#0D5263",
          950: "#0A3F4C"
        },
        'ferm-blue-dark': {
          50: "#F0FAFE",
          100: "#E2F5FE",
          200: "#C0E9FC",
          300: "#99DBFA",
          400: "#63C9F8",
          500: "#24B3F5",
          600: "#0A97D9",
          DEFAULT: "#0A97D9",
          700: "#0985BE",
          800: "#0770A1",
          900: "#054E70",
          950: "#033349"
        },
        // 'ferm-blue': {
        //   light: '#26BDE2',
        //   dark: '#0A97D9',
        // },
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
