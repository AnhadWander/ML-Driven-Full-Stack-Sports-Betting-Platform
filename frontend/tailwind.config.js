/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',
          400:'#818cf8',500:'#6366f1',600:'#5458ec',700:'#4b50e3',
          800:'#3f43c7',900:'#383cab'
        },
      },
      boxShadow: {
        soft: '0 6px 30px rgba(0,0,0,.25)',
      },
      borderRadius: { '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
