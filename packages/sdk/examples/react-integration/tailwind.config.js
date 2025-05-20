/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.{ts,tsx,html}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // CreataChain 브랜드 색상
        creata: {
          50: '#F0EDFC',
          100: '#E1DCF9',
          200: '#C3B9F3',
          300: '#A596ED',
          400: '#8773E7',
          500: '#6950E1',
          600: '#4A2DDB',
          700: '#3A24AF',
          800: '#2B1B82',
          900: '#1D1256',
        },
      },
    },
  },
  plugins: [],
};
