/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sparta: {
          green: '#004B23',
          dark: '#003318',
          gold: '#FFC72C',
          light: '#007236',
        }
      }
    },
  },
  plugins: [],
}