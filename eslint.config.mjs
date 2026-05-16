import nextPlugin from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'docs/**',
      '*.config.*',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo'
    ]
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        process: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        matchMedia: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        HTMLElement: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLButtonElement: 'readonly',
        SVGSVGElement: 'readonly',
        IntersectionObserver: 'readonly',
        AudioContext: 'readonly',
        Audio: 'readonly',
        URL: 'readonly',
        RegExp: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Promise: 'readonly',
        Array: 'readonly',
        Date: 'readonly',
        Object: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        Error: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        fetch: 'readonly'
      }
    },
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // Legit SSR-safe patterns (localStorage / matchMedia / pathname read on mount).
      // The React 19 strict version of this rule flags them but useSyncExternalStore is overkill.
      'react-hooks/set-state-in-effect': 'warn'
    }
  }
];
