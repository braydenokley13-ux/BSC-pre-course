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
        accent: { DEFAULT: "#2563eb", hover: "#1d4ed8", light: "#eff6ff" },
        bsc: {
          bg:            "#f8fafc",
          surface:       "#ffffff",
          "surface-2":   "#f1f5f9",
          border:        "#e2e8f0",
          "border-strong": "#cbd5e1",
          text:          "#0f172a",
          muted:         "#64748b",
          success:       "#16a34a",
          danger:        "#dc2626",
          warning:       "#d97706",
        },
        // Keep legacy semantic colors used in JSX
        gold: { DEFAULT: "#d97706", light: "#f59e0b", dark: "#b45309" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      animation: {
        "pulse-accent": "pulseAccent 2s ease-in-out infinite",
        "pulse-green":  "pulse-green 2s ease-in-out infinite",
        "pulse-red":    "pulse-red 1.5s ease-in-out infinite",
        "score-pop":    "scorePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        "card-reveal":  "cardReveal 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "fade-up":      "fadeUp 0.35s ease-out both",
        "corridor":     "corridor 2s linear infinite",
        "float":        "float 4s ease-in-out infinite",
      },
      keyframes: {
        "pulseAccent": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(37,99,235,0.45)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(37,99,235,0)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(22,163,74,0.5)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(22,163,74,0)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(220,38,38,0.5)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(220,38,38,0)" },
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
      boxShadow: {
        "accent-sm":  "0 0 0 1px rgba(37,99,235,0.15), 0 2px 8px rgba(37,99,235,0.12)",
        "accent-md":  "0 0 0 1px rgba(37,99,235,0.25), 0 4px 16px rgba(37,99,235,0.15)",
        "green-sm":   "0 0 0 1px rgba(22,163,74,0.2), 0 2px 8px rgba(22,163,74,0.1)",
        "red-sm":     "0 0 0 1px rgba(220,38,38,0.2), 0 2px 8px rgba(220,38,38,0.1)",
        "card":       "0 1px 4px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
