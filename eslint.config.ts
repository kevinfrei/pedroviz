import eslintReact from '@eslint-react/eslint-plugin';
import js from '@eslint/js';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import css from '@eslint/css';

export default defineConfig([
  { ignores: ['dist/', 'dev/', 'src/**/*.test.{ts,tsx}', 'src/bun-env.d.ts'] }, // ← global ignore, must be first
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
    files: ['*.js'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...eslintReact.configs['recommended-typescript'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['*.json'],
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
