const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'light-shade': '#FAFAF9',
        'light-accent': '#94A9A7',
        'brand': '#F69E2E',
        'dark-accent': '#905D3F',
        'dark-shade': '#14202A'
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ]
};