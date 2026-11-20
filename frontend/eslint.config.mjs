import { required as drupalCanvasRequired } from '@drupal-canvas/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Canvas components are portable, so they link with plain <a> elements
    // instead of next/link.
    files: ['components/**'],
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  ...drupalCanvasRequired,
  globalIgnores([
    '.canvas/**',
    '.next/**',
    'build/**',
    'dist/**',
    'node_modules/**',
    'out/**',
    'next-env.d.ts',
  ]),
]);
