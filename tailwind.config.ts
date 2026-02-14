import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-space)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        cardForeground: "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        mutedForeground: "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        primaryForeground: "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        accentForeground: "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        glow: "hsl(var(--glow))",
        // BNB Chain vibrant accents
        emerald: {
          muted: "hsl(var(--emerald-muted))",
          DEFAULT: "hsl(var(--emerald))",
        },
        violet: {
          muted: "hsl(var(--violet-muted))",
          DEFAULT: "hsl(var(--violet))",
        },
        navy: "hsl(var(--navy))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        glass:
          "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 80px rgba(0,0,0,0.45)",
        glow: "0 0 16px rgba(250, 204, 21, 0.16)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(circle at 20% 20%, rgba(250, 204, 21, 0.18), transparent 55%), radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.08), transparent 45%)",
        "panel-gradient":
          "linear-gradient(135deg, rgba(148, 163, 184, 0.08), rgba(15, 23, 42, 0.4))",
      },
      transitionTimingFunction: {
        "soft-spring": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "gradient-shift": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0.6" },
          "50%": { transform: "translate3d(-6%, 4%, 0)", opacity: "0.85" },
          "100%": { transform: "translate3d(4%, -3%, 0)", opacity: "0.6" },
        },
        "aura-breathe": {
          "0%": {
            transform: "scale(1) translate3d(0, 0, 0)",
            opacity: "0.5"
          },
          "33%": {
            transform: "scale(1.05) translate3d(-3%, 2%, 0)",
            opacity: "0.7"
          },
          "66%": {
            transform: "scale(1.03) translate3d(3%, -2%, 0)",
            opacity: "0.65"
          },
          "100%": {
            transform: "scale(1) translate3d(0, 0, 0)",
            opacity: "0.5"
          },
        },
        "hero-glow": {
          "0%": { transform: "scale(1)", opacity: "0.25" },
          "50%": { transform: "scale(1.03)", opacity: "0.35" },
          "100%": { transform: "scale(1)", opacity: "0.25" },
        },
        "particle-float": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0.15" },
          "50%": { transform: "translate3d(2%, -8%, 0)", opacity: "0.35" },
          "100%": { transform: "translate3d(-2%, -16%, 0)", opacity: "0.15" },
        },
        "particle-drift": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0.12" },
          "50%": { transform: "translate3d(-3%, -10%, 0)", opacity: "0.3" },
          "100%": { transform: "translate3d(3%, -20%, 0)", opacity: "0.08" },
        },
        "orb-float-slow": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0.55" },
          "50%": { transform: "translate3d(4%, -6%, 0)", opacity: "0.8" },
          "100%": { transform: "translate3d(-3%, 3%, 0)", opacity: "0.55" },
        },
        "orb-float-slower": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0.4" },
          "50%": { transform: "translate3d(-5%, 4%, 0)", opacity: "0.7" },
          "100%": { transform: "translate3d(3%, -2%, 0)", opacity: "0.4" },
        },
        "orb-drift": {
          "0%": { transform: "translate3d(0, 0, 0)", opacity: "0.25" },
          "50%": { transform: "translate3d(6%, 2%, 0)", opacity: "0.45" },
          "100%": { transform: "translate3d(-4%, -3%, 0)", opacity: "0.25" },
        },
        // BNB Liquid Atmosphere - Volumetric Bubble Drifts
        "liquid-drift-1": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.12" },
          "33%": { transform: "translate3d(-4%, 3%, 0) scale(1.05)", opacity: "0.09" },
          "66%": { transform: "translate3d(2%, -2%, 0) scale(0.98)", opacity: "0.11" },
          "100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.12" },
        },
        "liquid-drift-2": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.10" },
          "40%": { transform: "translate3d(3%, -4%, 0) scale(1.08)", opacity: "0.08" },
          "70%": { transform: "translate3d(-3%, 2%, 0) scale(0.95)", opacity: "0.10" },
          "100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.10" },
        },
        "liquid-drift-3": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.09" },
          "35%": { transform: "translate3d(5%, 2%, 0) scale(1.06)", opacity: "0.07" },
          "65%": { transform: "translate3d(-2%, -3%, 0) scale(0.97)", opacity: "0.09" },
          "100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.09" },
        },
        "liquid-drift-4": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.08" },
          "38%": { transform: "translate3d(-5%, -3%, 0) scale(1.07)", opacity: "0.06" },
          "68%": { transform: "translate3d(3%, 4%, 0) scale(0.96)", opacity: "0.08" },
          "100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.08" },
        },
        "liquid-drift-5": {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.11" },
          "36%": { transform: "translate3d(4%, -5%, 0) scale(1.04)", opacity: "0.08" },
          "72%": { transform: "translate3d(-3%, 2%, 0) scale(0.98)", opacity: "0.10" },
          "100%": { transform: "translate3d(0, 0, 0) scale(1)", opacity: "0.11" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "0.5",
            transform: "scale(1)"
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)"
          },
        },
        "capital-breathe": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.7",
          },
          "50%": {
            transform: "scale(1.015)",
            opacity: "0.9",
          },
        },
        "halo-expand": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.3",
          },
          "50%": {
            transform: "scale(1.08)",
            opacity: "0.5",
          },
        },
        "flow-glow": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.9",
            transform: "scale(1.02)",
          },
        },
        // Toast slide-in animations
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-out-to-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        "gradient-shift": "gradient-shift 42s ease-in-out infinite",
        "gradient-pan": "gradient-pan 60s ease-in-out infinite",
        "aura-breathe": "aura-breathe 28s ease-in-out infinite",
        "hero-glow": "hero-glow 45s ease-in-out infinite",
        "particle-float": "particle-float 32s ease-in-out infinite",
        "particle-drift": "particle-drift 26s ease-in-out infinite",
        "orb-float-slow": "orb-float-slow 38s ease-in-out infinite",
        "orb-float-slower": "orb-float-slower 44s ease-in-out infinite",
        "orb-drift": "orb-drift 34s ease-in-out infinite",
        // BNB Liquid Atmosphere - Non-synchronized slow drifts
        "liquid-drift-1": "liquid-drift-1 47s ease-in-out infinite",
        "liquid-drift-2": "liquid-drift-2 41s ease-in-out infinite",
        "liquid-drift-3": "liquid-drift-3 38s ease-in-out infinite",
        "liquid-drift-4": "liquid-drift-4 50s ease-in-out infinite",
        "liquid-drift-5": "liquid-drift-5 35s ease-in-out infinite",
        "pulse-glow": "pulse-glow 8s ease-in-out infinite",
        "flow-glow": "flow-glow 18s ease-in-out infinite",
        "capital-breathe": "capital-breathe 15s ease-in-out infinite",
        "halo-expand": "halo-expand 15s ease-in-out infinite",
        // Toast animations
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "slide-out-to-right": "slide-out-to-right 0.2s ease-in",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.15s ease-in",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
