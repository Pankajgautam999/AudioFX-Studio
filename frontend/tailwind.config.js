/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#05050a",
          900: "#0a0a12",
          800: "#12121d",
          700: "#1c1c2b",
          600: "#282840",
        },
        accent: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        pulse: {
          400: "#f472b6",
          500: "#ec4899",
        },
        glow: {
          400: "#38bdf8",
          500: "#0ea5e9",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "aurora-gradient": "radial-gradient(60% 60% at 20% 20%, rgba(139,92,246,0.35) 0%, rgba(0,0,0,0) 60%), radial-gradient(50% 50% at 80% 30%, rgba(236,72,153,0.25) 0%, rgba(0,0,0,0) 60%), radial-gradient(60% 60% at 50% 90%, rgba(14,165,233,0.25) 0%, rgba(0,0,0,0) 60%)",
        "card-sheen": "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(139,92,246,0.55)",
        "glow-pink": "0 0 40px -10px rgba(236,72,153,0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
