import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        localStorage: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.config.js',
        '**/*.d.ts'
        // src/js/main.js used to be excluded as "tested via integration
        // tests", but no automated integration suite exercises it (#627).
        // It is now unit-testable (MainGame.worldInputs.test.js imports it
        // with __DSD_NO_AUTOBOOT__), so it stays in the report and shows its
        // real coverage.
      ]
    },
    include: ['test/**/*.test.js', 'test/**/*.spec.js'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});

