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
        surface: "#f8faf7",
        ink: "#172033",
        accent: "#6f9f77",
        accentSoft: "#eef8f1",
      },
    },
  },
  plugins: [],
};

export default config;
