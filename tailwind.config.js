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
        Headline: ['roc-grotesk-wide', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [    require('@tailwindcss/aspect-ratio'),
],
};
