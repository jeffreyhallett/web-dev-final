import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const eslintConfig = defineConfig([
   ...nextVitals,
   ...nextTs,
   prettier, // Disables ESLint rules that conflict with Prettier
   {
      files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
      languageOptions: {
         parser: tsParser,
         parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
         },
      },
      plugins: {
         '@typescript-eslint': tseslint,
      },
      rules: {
         // Your custom rules
         '@typescript-eslint/no-unused-vars': [
            'warn',
            {
               argsIgnorePattern: '^_',
               varsIgnorePattern: '^_',
            },
         ],
         '@typescript-eslint/no-explicit-any': 'warn',
         'no-console': ['warn', { allow: ['warn', 'error'] }],
         'react/no-unescaped-entities': 'off',
      },
   },
   globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
]);

export default eslintConfig;
