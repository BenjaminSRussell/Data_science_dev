// ESLint flat config (ESLint 9+/10). Run with `npm run lint`.
//
// ecmaVersion "latest" enables parsing of modern syntax such as class
// fields (ES2022), which files like src/js/game/MapBuildingSystem.js and
// src/js/utils/DOMUtils.js use.
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/wasm/**', 'coverage/**']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Style rules surfaced as warnings so `npm run lint` fails only on
      // real errors while the existing code is cleaned up
      'no-case-declarations': 'warn',
      'no-useless-escape': 'warn',
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn'
    }
  },
  {
    files: ['test/**/*.js', 'tools/**/*.js', 'scripts/**/*.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn'
    }
  },
  {
    // Game code (not tests under src/): an undeclared name or a case-clause
    // binding is a lint error, and CI runs `npm run lint`. A misplaced block
    // in StorylineManager.checkPhaseTransition read undeclared `phase` and
    // threw ReferenceError on every call (#4, #515).
    files: ['src/**/*.js'],
    ignores: ['src/**/*.test.js'],
    rules: {
      'no-undef': 'error',
      'no-case-declarations': 'error'
    }
  }
];
