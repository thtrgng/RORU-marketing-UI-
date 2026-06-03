import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        roru: {
          bg: "#0a0e1a",
          surface: "#111827",
          border: "#1f2937",
          accent: "#8b6343",
          "accent-light": "#a97c52",
          text: "#e5e7eb",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
