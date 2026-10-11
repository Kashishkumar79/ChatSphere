/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070c1b",
        surface: "#0c1530",
        surface2: "#111d3d",
        line: "#1c2b52",
        ink: "#e6ecff",
        muted: "#8593b8",
        dim: "#4d5d86",
        brand: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        accent: "#22d3ee",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
