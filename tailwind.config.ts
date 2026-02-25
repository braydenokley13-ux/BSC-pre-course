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
        gold: { DEFAULT: "#C9A84C", light: "#E8C56A", dark: "#A07830" },
        bsc: {
          bg: "#0A0C10",
          card: "#10141C",
          border: "#1E2435",
          muted: "#6B7280",
          accent: "#C9A84C",
          green: "#22C55E",
          red: "#EF4444",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
