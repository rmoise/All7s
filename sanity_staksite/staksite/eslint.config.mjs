import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import prettierConfig from 'eslint-config-prettier';
import { configs as tsConfigs } from '@typescript-eslint/eslint-plugin'; // Correct import
import tsParser from '@typescript-eslint/parser'; // Import the TypeScript parser

export default [
  js.configs.recommended,
  tsConfigs.recommended,
  prettierConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'], // Adjust according to your project
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        document: true,
        window: true,
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      'no-unused-vars': 'warn',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
