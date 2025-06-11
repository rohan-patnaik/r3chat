import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Direct color definitions (Tailwind v4 compatible)
        background: "#0E1117",
        foreground: "#E5E7EB",
        
        // Surface colors
        "surface-0": "#0E1117",
        "surface-1": "#161B22",
        
        // Text colors
        "text-primary": "#E5E7EB",
        "text-secondary": "#9CA3AF",
        
        // Accent colors
        "accent-500": "#D946EF",
        "accent-600": "#C03FDD",
        
        // Border color
        "border-subtle": "#333333",
        
        // Utility colors
        destructive: {
          DEFAULT: "#FF5656",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.3rem",
        sm: "0.1rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;