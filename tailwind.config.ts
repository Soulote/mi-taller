import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        foreground: "var(--text)",
        card: "var(--card)",
        cardBorder: "var(--cardBorder)",
        muted: "var(--muted)",
      },
      boxShadow: {
        glass: "var(--shadow)",
      }
    },
  },
  plugins: [],
};
export default config;
