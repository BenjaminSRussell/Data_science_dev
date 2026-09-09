import { defineConfig } from 'vite';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The music tracks live in the top-level assets/audio/ directory, but Vite
// only serves files from publicDir (public/) at the site root. Copy
// assets/audio into public/assets/audio at the start of dev/build so that
// requests like /assets/audio/music/*.mp3 (built by AudioManager) resolve.
function copyAudioAssets() {
  return {
    name: 'copy-audio-assets',
    buildStart() {
      const src = join(__dirname, 'assets', 'audio');
      const dest = join(__dirname, 'public', 'assets', 'audio');
      if (existsSync(src)) {
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(src, dest, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  root: './',
  publicDir: 'public',
  plugins: [copyAudioAssets()],
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
