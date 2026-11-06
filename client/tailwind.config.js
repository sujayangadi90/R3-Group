/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F1F1F',
          dark: '#151515',
          light: '#2E2E2E',
        },
        gold: {
          DEFAULT: '#B58A3A',
          light: '#cf9f45',
          dark: '#98722c',
          subtle: '#F9F5EC',
          border: '#E2C389',
        },
        surface: {
          DEFAULT: '#FDF9F5',
          warm: '#F7F7F5',
          card: '#FFFFFF',
          container: '#F1EDE9',
          border: '#ECE7E1',
        },
        charcoal: {
          900: '#121212',
          800: '#1F1F1F',
          700: '#2A2A2A',
          600: '#444748',
          500: '#706E6B',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 12px 32px -4px rgba(31, 31, 31, 0.06), 0 4px 12px -2px rgba(31, 31, 31, 0.03)',
        'luxury-hover': '0 20px 40px -4px rgba(31, 31, 31, 0.12), 0 8px 16px -2px rgba(31, 31, 31, 0.06)',
      },
    },
  },
  plugins: [],
};
