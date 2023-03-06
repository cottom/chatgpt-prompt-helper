/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',
  content: ['./**/*.tsx'],
  plugins: [require('@tailwindcss/line-clamp'), require('@tailwindcss/forms')]
}
