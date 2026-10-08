import { defineConfig } from 'vite';
import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Most game assets (audio, location backgrounds, icons, map tiles, characters)
// live in the top-level assets/ directory, but Vite only serves publicDir
// (public/) at the site root, so /assets/icons/... etc. used to 404 (#2285,
// #1039, #2536). Serve assets/ at /assets in dev (public/ still wins for files
// it has, e.g. assets/npcs) and copy it into dist/assets after a build. This
// replaces the old buildStart copies into public/, which left large untracked
// copies in the working tree.
const ASSETS_ROOT = join(__dirname, 'assets');
const MIME_TYPES = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.mp4': 'video/mp4',
  '.vtt': 'text/vtt'
};

export function resolveTopLevelAsset(urlPath, root = ASSETS_ROOT) {
  let rel;
  try {
    rel = decodeURIComponent(String(urlPath || '').split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  const file = normalize(join(root, rel));
  if (file !== root && !file.startsWith(root + sep)) return null; // no ../ escapes
  return existsSync(file) && statSync(file).isFile() ? file : null;
}

function serveTopLevelAssets() {
  let outDir = join(__dirname, 'dist');
  return {
    name: 'serve-top-level-assets',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    configureServer(server) {
      server.middlewares.use('/assets', (req, res, next) => {
        const file = resolveTopLevelAsset(req.url);
        if (!file || existsSync(join(__dirname, 'public', 'assets', req.url.split('?')[0]))) return next();
        res.setHeader('Content-Type', MIME_TYPES[extname(file).toLowerCase()] || 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (existsSync(ASSETS_ROOT)) {
        // force:false keeps anything public/ (or the bundle) already wrote
        cpSync(ASSETS_ROOT, join(outDir, 'assets'), { recursive: true, force: false });
      }
    }
  };
}

export default defineConfig({
  root: './',
  publicDir: 'public',
  plugins: [serveTopLevelAssets()],
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
  // react/react-dom were leftovers from an abandoned React UI, and 'wasm' is
  // not a package name, so excluding it did nothing (#1872, #2341)
  optimizeDeps: {
    include: ['zustand/vanilla', 'zustand/middleware']
  },
  resolve: {
    conditions: ['import', 'module', 'browser', 'default']
  }
});
