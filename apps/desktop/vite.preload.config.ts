import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  mode: "production",
  build: {
    target: "node18",
    outDir: "dist-electron",
    lib: {
      entry: "src/electron/preload.ts",
      formats: ["cjs"],
      fileName: () => "preload.js",
    },
    rollupOptions: {
      external: ["electron"],
      output: {
        entryFileNames: "preload.js",
      },
    },
    emptyOutDir: false,
    minify: false,
  },
  define: {
    __dirname: "import.meta.dirname",
  },
});
