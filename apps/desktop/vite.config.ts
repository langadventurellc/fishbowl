import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Optimize for Electron renderer process
  build: {
    target: "chrome120", // Modern Chrome target for Electron
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false, // Disable sourcemaps for production
    rollupOptions: {
      input: "index.html",
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: "localhost",
    hmr: {
      port: 5174,
    },
  },

  // Environment variables
  envPrefix: ["VITE_", "RENDERER_"],

  // CSS handling
  css: {
    devSourcemap: true,
  },

  // Define global constants
  define: {
    __IS_ELECTRON__: true,
  },

  // Clear screen on startup
  clearScreen: false,

  // Base path for assets
  base: "./",
});
