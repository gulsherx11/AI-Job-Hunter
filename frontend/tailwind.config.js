/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0F1117",
        card: "#1E2130",
        border: "#2D3250",
        accent: "#6C63FF",
        success: "#00D9A6",
        muted: "#8892A4",
        danger: "#FF6B6B",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}