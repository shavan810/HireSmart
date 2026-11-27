/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3ff',
          100: '#dce6fb',
          200: '#b8c9f0',
          300: '#8ea6dc',
          400: '#5f7fc4',
          500: '#3a5ca6',
          600: '#27478b',
          700: '#183470',
          800: '#0b1f4b',
          900: '#071538',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 31, 75, 0.05), 0 4px 14px rgba(11, 31, 75, 0.06)',
        pop: '0 12px 32px rgba(11, 31, 75, 0.18)',
      },
    },
  },
  plugins: [],
};
