/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const plugin = require('tailwindcss/plugin')

export default {
  darkMode: 'class',
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
        primary: 'rgb(var(--primary))',
        'primary-inverse': 'rgb(var(--primary-inverse))',
        'primary-hover': 'rgb(var(--primary-hover))',
        'primary-active-color': 'rgb(var(--primary-active-color))',

        'primary-highlight': 'rgb(var(--primary)/var(--primary-highlight-opacity))',
        'primary-highlight-inverse': 'rgb(var(--primary-highlight-inverse))',
        'primary-highlight-hover': 'rgb(var(--primary)/var(--primary-highlight-hover-opacity))',

        'primary-50': 'rgb(var(--primary-50))',
        'primary-100': 'rgb(var(--primary-100))',
        'primary-200': 'rgb(var(--primary-200))',
        'primary-300': 'rgb(var(--primary-300))',
        'primary-400': 'rgb(var(--primary-400))',
        'primary-500': 'rgb(var(--primary-500))',
        'primary-600': 'rgb(var(--primary-600))',
        'primary-700': 'rgb(var(--primary-700))',
        'primary-800': 'rgb(var(--primary-800))',
        'primary-900': 'rgb(var(--primary-900))',
        'primary-950': 'rgb(var(--primary-950))',

        'surface-0': 'rgb(var(--surface-0))',
        'surface-50': 'rgb(var(--surface-50))',
        'surface-100': 'rgb(var(--surface-100))',
        'surface-200': 'rgb(var(--surface-200))',
        'surface-300': 'rgb(var(--surface-300))',
        'surface-400': 'rgb(var(--surface-400))',
        'surface-500': 'rgb(var(--surface-500))',
        'surface-600': 'rgb(var(--surface-600))',
        'surface-700': 'rgb(var(--surface-700))',
        'surface-800': 'rgb(var(--surface-800))',
        'surface-900': 'rgb(var(--surface-900))',
        'surface-950': 'rgb(var(--surface-950))',


        'ferm-gray': {
          DEFAULT: '#F4F4F4',
        },
        'ferm-black': {
          DEFAULT: '#1D1D1B',
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
      }
    }
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
}

