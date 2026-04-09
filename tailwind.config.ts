import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f5efe2",
        ink: "#1d1f1a",
        accent: "#14532d",
        accentSoft: "#d9f99d",
      },
    },
  },
  plugins: [],
};

export default config;
