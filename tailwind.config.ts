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
        arena: {
          black:   "#020408",
          deep:    "#0a0c12",
          navy:    "#060a14",
          card:    "#0d1120",
          border:  "#1a2030",
          gold:    "#c9a84c",
          "gold-dim": "#8a6d2e",
          "gold-glow": "rgba(201,168,76,0.15)",
          green:   "#22c55e",
          "green-glow": "rgba(34,197,94,0.15)",
          red:     "#ef4444",
          "red-glow": "rgba(239,68,68,0.15)",
          muted:   "#6b7280",
          text:    "#e5e7eb",
          "text-dim": "#9ca3af",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      animation: {
        "pulse-gold":  "pulse-gold 2s ease-in-out infinite",
        "pulse-green": "pulse-green 2s ease-in-out infinite",
        "pulse-red":   "pulse-red 1.5s ease-in-out infinite",
        "glow-gold":   "glow-gold 3s ease-in-out infinite",
        "glow-green":  "glow-green 3s ease-in-out infinite",
        "scanline":    "scanline 8s linear infinite",
        "score-pop":   "scorePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "card-reveal": "cardReveal 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "fade-up":     "fadeUp 0.35s ease-out both",
        "typewriter":  "typewriter 0.8s steps(40,end) both",
        "corridor":    "corridor 2s linear infinite",
        "float":       "float 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,168,76,0.5)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(201,168,76,0)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.5)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(34,197,94,0)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.5)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(239,68,68,0)" },
        },
        "glow-gold": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(201,168,76,0.2), 0 0 0 1px rgba(201,168,76,0.15)" },
          "50%":       { boxShadow: "0 0 24px rgba(201,168,76,0.45), 0 0 0 1px rgba(201,168,76,0.4)" },
        },
        "glow-green": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(34,197,94,0.2), 0 0 0 1px rgba(34,197,94,0.15)" },
          "50%":       { boxShadow: "0 0 24px rgba(34,197,94,0.4), 0 0 0 1px rgba(34,197,94,0.35)" },
        },
        "fadeUp": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-4px)" },
        },
        "corridor": {
          "0%":   { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      backgroundImage: {
        "arena-bg":  "radial-gradient(ellipse 90% 65% at 50% 15%, #0d1525 0%, #020408 72%)",
        "spotlight": "radial-gradient(ellipse 65% 45% at 50% 50%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        "spotlight-red": "radial-gradient(ellipse 65% 45% at 50% 50%, rgba(239,68,68,0.07) 0%, transparent 70%)",
        "card-sheen": "linear-gradient(135deg, rgba(201,168,76,0.04) 0%, transparent 60%)",
      },
      boxShadow: {
        "gold-sm":  "0 0 12px rgba(201,168,76,0.2), 0 0 0 1px rgba(201,168,76,0.15)",
        "gold-md":  "0 0 24px rgba(201,168,76,0.35), 0 0 0 1px rgba(201,168,76,0.3)",
        "gold-lg":  "0 0 40px rgba(201,168,76,0.4), 0 0 0 1px rgba(201,168,76,0.35)",
        "green-sm": "0 0 12px rgba(34,197,94,0.2), 0 0 0 1px rgba(34,197,94,0.15)",
        "green-md": "0 0 24px rgba(34,197,94,0.35), 0 0 0 1px rgba(34,197,94,0.3)",
        "red-sm":   "0 0 12px rgba(239,68,68,0.25), 0 0 0 1px rgba(239,68,68,0.2)",
        "card":     "0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)",
      },
    },
  },
  plugins: [],
};

export default config;
