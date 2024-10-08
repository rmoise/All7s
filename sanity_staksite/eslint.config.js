import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import sanityConfig from '@sanity/eslint-config-studio'; // Sanity config as default CommonJS

// Since Sanity config uses CommonJS, access it like this
const sanityRecommended = sanityConfig;

export default [
  js.configs.recommended,
  sanityRecommended, // No need for destructuring
  {
    files: ['**/*.js', '**/*.jsx'], // Adjust according to your project
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        document: true,
        window: true,
      },
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
