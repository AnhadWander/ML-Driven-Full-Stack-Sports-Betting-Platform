/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        court:  "#0f172a",
        hoop:   "#ff7f11",
      },
    },
  },
  plugins: [],
};
