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
          bg: "#1c1917",
          sidebar: "#171512",
          surface: "#252220",
          "user-bubble": "#2a2724",
          border: "#302e2b",
          "border-subtle": "#252220",
          accent: "#cc785c",
          "accent-hover": "#d98b6f",
          text: "#eeece8",
          muted: "#97948f",
          "input-bg": "#211f1d",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        chat: ["15px", { lineHeight: "1.65" }],
      },
      maxWidth: {
        chat: "680px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
