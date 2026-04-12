/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { 50:'#e8eaf2', 800:'#112240', 900:'#0a1628' },
        gold:    { 400:'#e8c96b', 500:'#c9a84c', 600:'#8a6f30' },
        crimson: { 50:'#fef2f2', 500:'#c0152a', 600:'#991020' },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
