import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: "#0a0a0f",
          card: "rgba(26, 26, 36, 0.6)",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#e5e5e5",
          muted: "#94a3b8",
          accent: "#22d3ee",
          "accent-glow": "rgba(34, 211, 238, 0.4)",
          danger: "#ef4444",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
