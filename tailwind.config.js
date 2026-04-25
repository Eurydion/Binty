/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#2C2C2C',
        kangkong: '#4F7942',
        cloud: '#F9F9F9',
        kamote: '#E1AD01',
        teal: '#4A9B9B',
        silverBlue: '#A7C7E7',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}