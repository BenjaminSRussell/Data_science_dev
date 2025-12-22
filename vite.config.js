import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    target: 'esnext'
  },
  server: {
    host: '127.0.0.1',
    port: 5176,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    exclude: ['wasm'],
    include: ['zustand', 'react', 'react-dom']
  },
  resolve: {
    conditions: ['import', 'module', 'browser', 'default']
  }
});
