/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dui-green': '#1B5E20',
        'dui-light': '#F5F5F0',
        'dui-accent': '#FFB74D',
      },
    },
  },
  plugins: [],
}
