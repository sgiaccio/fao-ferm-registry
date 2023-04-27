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
        'roboto-slab': ['"Roboto Slab"'],
        'roboto-condensed': ['"Roboto Condensed"'],
        'roboto-flex': ['"Roboto Flex"'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
  darkMode: 'class',
}
