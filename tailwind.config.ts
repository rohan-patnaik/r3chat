import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brown-based color system
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        accent: {
          primary: "var(--accent-primary)",
          hover: "var(--accent-hover)",
        },
        border: {
          subtle: "var(--border-subtle)",
          primary: "var(--border-primary)",
        },
        // Status colors (theme-aware)
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--danger-warning)", // Updated to use --danger-warning
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "message-in": "messageIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px var(--accent-primary)" },
          "50%": { boxShadow: "0 0 20px var(--accent-primary)" },
        },
        messageIn: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;