/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#155EEF',
          dark: '#101828',
          cyan: '#20C5F5',
          purple: '#673DE6',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          muted: '#667085',
          border: '#E2E8F0',
          hover: '#0C4ECE',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
        'card-hover': '0 8px 24px rgba(21, 94, 239, 0.12), 0 2px 6px rgba(16, 24, 40, 0.04)',
        'elevated': '0 12px 32px rgba(16, 24, 40, 0.08)',
      },
    },
  },
  plugins: [],
}

