import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      // React plugin automatically handles Fast Refresh in development
    }),
  ],

  // Configure for Electron renderer process
  base: './',
  root: 'src/renderer',

  // Build configuration
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
    target: ['chrome120'], // Target latest Electron Chrome version
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/renderer/index.html'),
      },
      output: {
        manualChunks: id => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            return 'vendor';
          }
          // Feature chunks
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
        },
        // Production optimizations
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500,
    reportCompressedSize: process.env.ANALYZE === 'true',
  },

  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost', // Use localhost for Electron integration
    hmr: {
      overlay: true,
      port: 5173, // Use same port for Electron compatibility
    },
    open: false, // Don't open browser in Electron app
    strictPort: true, // Fail if port is occupied
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
      // Use polling for better file watching in Electron
      usePolling: process.env.NODE_ENV === 'development',
      interval: 100,
    },
    cors: true, // Enable CORS for Electron integration
    fs: {
      strict: false, // Allow serving files outside of root
    },
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
      '@store': resolve(__dirname, 'src/renderer/store'),
    },
  },

  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
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
