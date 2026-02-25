import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
