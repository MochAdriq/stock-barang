/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4988C4",
          dark: "#006EC4",
        },
        dark: "#16151C",
      },
    },
  },
  plugins: [],
};
