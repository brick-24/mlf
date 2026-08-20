/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(24, 38, 70, 0.18)",
      },
    },
  },
  plugins: [],
};
