/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chatgpt-bg': '#f7f7f8',
        'chatgpt-border': '#e5e5e6',
        'chatgpt-text': '#353740',
        'chatgpt-text-light': '#8e8ea0',
      }
    },
  },
  plugins: [],
}
