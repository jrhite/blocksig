import js from '@eslint/js';
import esConfigPrettier from 'eslint-config-prettier';
import reactConfig from 'eslint-plugin-react/configs/recommended.js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactConfig,
  esConfigPrettier,
];
