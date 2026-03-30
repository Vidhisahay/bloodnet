/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blood: {
          50:  "#fff1f1",
          100: "#ffe0e0",
          500: "#DC2626",
          600: "#B91C1C",
          700: "#991B1B",
        }
      }
    },
  },
  plugins: [],
}