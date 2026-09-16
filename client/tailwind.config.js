/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color, #17212b)',
          secondaryBg: 'var(--tg-theme-secondary-bg-color, #232e3c)',
          text: 'var(--tg-theme-text-color, #ffffff)',
          hint: 'var(--tg-theme-hint-color, #708499)',
          link: 'var(--tg-theme-link-color, #6ab2f2)',
          button: 'var(--tg-theme-button-color, #5288c1)',
          buttonText: 'var(--tg-theme-button-text-color, #ffffff)',
          bubble: '#182533',
          bubbleOut: '#2b5278'
        }
      }
    },
  },
  plugins: [],
}
