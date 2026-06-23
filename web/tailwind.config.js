/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink:   '#FF6B9D',
          mint:   '#4ECDC4',
          amber:  '#FFD93D',
          dark:   '#2B2D42',
          bg:     '#FFF8F5',
          danger: '#FF4757',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
