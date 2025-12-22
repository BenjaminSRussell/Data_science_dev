import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.config.js',
        '**/*.d.ts',
        'src/js/main.js' // Main entry point, tested via integration tests
      ]
    },
    include: ['**/*.test.js', '**/*.spec.js'],
    exclude: ['node_modules', 'dist', 'test/']
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});

