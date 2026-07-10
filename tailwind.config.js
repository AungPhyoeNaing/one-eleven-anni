/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#030014',
          blue: '#13113c',
          purple: '#2b0b4a',
          pink: '#b66898',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
      }
    },
  },
  plugins: [],
}
