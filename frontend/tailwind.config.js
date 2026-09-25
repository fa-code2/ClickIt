/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        raspberry: '#C2255C',
        'pink-grapefruit': '#E6687D',
        lemon: '#F59E0B',
        lime: '#84CC16',
        vanilla: '#F3E8C6',
        cream: '#FFFBEB',
      },
    },
  },
  plugins: [],
}