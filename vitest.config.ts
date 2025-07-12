import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts', './tests/integration/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['node_modules', 'dist'],
    // Enable automatic cleanup to prevent state leakage
    clearMocks: true,
    unstubGlobals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@main': path.resolve(__dirname, './src/main'),
      '@preload': path.resolve(__dirname, './src/preload'),
    },
  },
});
