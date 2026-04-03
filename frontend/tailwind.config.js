/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'encgo-red': '#E53935',
        'encgo-red-dark': '#B71C1C',
        'encgo-orange': '#FF7043',
        'encgo-gray-light': '#F5F5F5',
        'encgo-gray-dark': '#333333',
      }
    },
  },
  plugins: [],
}