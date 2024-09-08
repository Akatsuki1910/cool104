import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  base: process.env.BUILD_BASE ?? "/",
  server: {
    host: true,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./src/index.html",
      },
    },
  },
});
