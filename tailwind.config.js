/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#e8eaf2',
          800: '#112240',
          900: '#0a1628',
          950: '#050931',
        },
        crimson: {
          50:  '#fef2f2',
          500: '#c0152a',
          600: '#991020',
          700: '#7e0606',
        },
        gold: {
          400: '#e8c96b',
          500: '#c9a84c',
          600: '#8a6f30',
        },
        steel: {
          400: '#8299c0',
          500: '#505e78',
          600: '#212c42',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        sans:    ['Rajdhani', 'sans-serif'],
        nav:     ['Lato', 'sans-serif'],
        serif:   ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'rl-footer':  'linear-gradient(123deg, #050931, #182f64)',
        'rl-hero':    'linear-gradient(172deg, rgba(3,1,1,0.82), rgba(21,29,44,0.92))',
        'rl-stripe':  'linear-gradient(172deg, #7e0606, #b70000 32%, #810000 69%, #830000)',
        'rl-silver':  'radial-gradient(circle at 0 0, #fff 9%, #d9d9d9 32%, #d9d9d9 68%, #aeaeae)',
      },
      letterSpacing: {
        military: '0.2em',
        wide2:    '0.15em',
      },
    },
  },
  plugins: [],
}
