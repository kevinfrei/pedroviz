import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import css from '@eslint/css';

export default defineConfig([
  { ignores: ['dist/', 'dev/', '.vscode/'] }, // ← global ignore, must be first
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          enableAutofixRemoval: { imports: true },
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...eslintReact.configs['recommended-typescript'],
  },
  {
    files: ['*.js', 'src/*.ts', 'src/server/**/*.ts'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['src/client/*.{ts,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
  {
    rules: {
      '@eslint-react/dom-no-render': 'off',
      '@eslint-react/dom-no-render-return-value': 'off',
    },
  },
]);
