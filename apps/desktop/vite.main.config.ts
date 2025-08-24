import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: "src/electron/main.ts",
      formats: ["es"],
      fileName: () => "main.js",
    },
    outDir: "dist-electron/electron",
    rollupOptions: {
      external: [
        "electron",
        "better-sqlite3",
        // Keep these Node.js modules external since they're built-in
        "fs",
        "fs/promises",
        "path",
        "os",
        "crypto",
        "events",
        "util",
        "stream",
        "buffer",
        "node:fs",
        "node:path",
        "node:os",
        "node:crypto",
        "node:url",
      ],
    },
    target: "node18",
    emptyOutDir: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@fishbowl-ai/shared": path.resolve(
        __dirname,
        "../../packages/shared/src",
      ),
      "@fishbowl-ai/ui-shared": path.resolve(
        __dirname,
        "../../packages/ui-shared/src",
      ),
    },
    conditions: ["node", "import", "require"],
  },
  define: {
    // Ensure process.env is available
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development",
    ),
  },
  esbuild: {
    platform: "node",
    target: "node18",
  },
});
