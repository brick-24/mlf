/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./mlf-partners.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Serif headlines for an editorial / development-finance register;
        // Lato is MicroLoan Foundation's own brand typeface.
        // quoted: the family name contains spaces and a digit
        display: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["Lato", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#563061", // plum, from the MLF theme stylesheet
          deep: "#3d2145",
          soft: "#bd93ca",
          teal: "#32b2ca",
          gold: "#eea526",
        },
        paper: "#f7f7f5",
        rule: "#e4e4e0",
      },
      boxShadow: {
        // borders carry the structure on a flat canvas; shadows stay minimal
        glass: "0 1px 2px rgba(16, 24, 40, 0.05)",
        card: "0 1px 2px rgba(16, 24, 40, 0.05)",
      },
      borderRadius: {
        lg: "6px",
        xl: "6px",
        "2xl": "6px",
        "3xl": "8px",
      },
    },
  },
  plugins: [],
};
