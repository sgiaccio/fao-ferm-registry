module.exports = {
  purge: [
    './src/**/*.html',
    './src/**/*.cljs',
  ],
 darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
