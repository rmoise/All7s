/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'justify-start',
    'justify-center',
    'justify-end',
    'font-headline'
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
