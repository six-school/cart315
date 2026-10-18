import type { Config } from "prettier";

export default {
  printWidth: 100,
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
  tailwindStylesheet: "src/styles/global.css",
  tailwindFunctions: ["cx"],
} satisfies Config;
