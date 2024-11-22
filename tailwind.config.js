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
    'font-headline',
    'transform',
    'transition',
    'ease-out',
    'duration-300',
    'translate-y-2',
    'opacity-0',
    'translate-y-0',
    'translate-x-2',
    'opacity-100',
    'translate-x-0'
  ],
  theme: {
    extend: {
      zIndex: {
        '-10': '-10',
        '-1': '-1',
      },
      fontFamily: {
        'headline': ['roc-grotesk-wide', 'system-ui', 'sans-serif'],
        'sans': ['roc-grotesk-wide', 'system-ui', 'sans-serif'],
      },
      colors: {
        'primary': '#your-primary-color',
        'secondary': '#your-secondary-color',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
