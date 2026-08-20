import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/mlf/",
  build: {
    rollupOptions: {
      input: {
        // the site, plus the standalone partner register page
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        partners: fileURLToPath(new URL("./mlf-partners.html", import.meta.url)),
      },
    },
  },
});
