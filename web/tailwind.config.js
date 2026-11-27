/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brun: { 900: "#2b1d14", 700: "#4a3222", 500: "#7a5638" },
        beige: { 100: "#f6efe4", 300: "#e6d6bd" },
        creme: "#fbf8f3",
        piVert: "#2f7d4f",
      },
      fontFamily: { titre: ["Georgia", "serif"] },
    },
  },
  plugins: [],
};
