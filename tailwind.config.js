/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.js", 
    "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#ffffff",
          chip: "#f3f4f6",
          border: "#e5e7eb",
          text: "#111827",
          subtext: "#6b7280",
          highlight: "#eef2ff"
        },
      },
    },
  },
  plugins: [],
}