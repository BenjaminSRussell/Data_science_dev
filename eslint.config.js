// ESLint flat config (ESLint 9+).
//
// ecmaVersion "latest" enables parsing of modern syntax such as class
// fields (ES2022), which files like src/js/game/MapBuildingSystem.js and
// src/js/utils/DOMUtils.js use. With an older ecmaVersion, eslint fails on
// those files with "Unexpected token =".
export default [
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  }
];
