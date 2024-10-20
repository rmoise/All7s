/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'justify-start',
    'justify-center',
    'justify-end',
  ],
  theme: {
    extend: {
      zIndex: {
        '-10': '-10',
        '-1': '-1',
      },
      fontFamily: {
        'headline': ['roc-grotesk-wide', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'primary': '#your-primary-color',
        'secondary': '#your-secondary-color',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
