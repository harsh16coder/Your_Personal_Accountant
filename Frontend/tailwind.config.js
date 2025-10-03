/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'card-blue': '#7FB3D3',
        'primary-blue': '#5A9BD4',
        'dark-blue': '#4682B4'
      }
    },
  },
  plugins: [],
}