/** @type {import('tailwindcss').Config} */
// Tailwind config — scans all TSX/TS files for class names
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          500: '#4f6ef7',
          600: '#3b55e6',
          900: '#1a237e',
        }
      }
    },
  },
  plugins: [],
}