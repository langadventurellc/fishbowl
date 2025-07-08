import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: process.env.NODE_ENV === 'development',
      // Enable React DevTools in development
      babel: {
        plugins: [
          ...(process.env.NODE_ENV === 'development' ? ['react-devtools'] : []),
        ],
      },
    }),
  ],

  // Configure for Electron renderer process
  base: './',

  // Build configuration
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/renderer/index.html'),
      },
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      overlay: true,
    },
    open: false, // Don't open browser in Electron app
  },

  // Path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@preload': resolve(__dirname, 'src/preload'),
      '@components': resolve(__dirname, 'src/renderer/components'),
      '@hooks': resolve(__dirname, 'src/renderer/hooks'),
      '@styles': resolve(__dirname, 'src/renderer/styles'),
    },
  },

  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development',
    ),
    // Enable React DevTools in development
    __REACT_DEVTOOLS_GLOBAL_HOOK__: process.env.NODE_ENV === 'development',
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    devSourcemap: process.env.NODE_ENV === 'development',
  },

  // Optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
