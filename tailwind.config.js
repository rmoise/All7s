
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'Headline': ['roc-grotesk-wide', ...defaultTheme.fontFamily.sans],
    },
  },
  variants:{
    extend:{},
  },
  plugins: [

  ],
};
