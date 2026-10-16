import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://mage.perd.us",
  output: "static",
  integrations: [react()],
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: { "/socket.io": { target: "http://localhost:3001", ws: true } },
    },
  },
  devToolbar: { enabled: false },
});
