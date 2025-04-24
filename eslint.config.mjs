import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'prisma/**',
      '*.js',
      '.eslintrc.js',
      'jest.config.js',
      '.idea'
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: '.',
        sourceType: 'module',
      },
      ecmaVersion: 2020,
      globals: {
        node: true,
        jest: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      ...prettierPlugin.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      'newline-before-return': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          'selector': 'interface',
          'format': ['PascalCase']
        }
      ],
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        "caughtErrorsIgnorePattern": "^_",
      }],
      'max-len': ['error', { 'code': 120, ignoreStrings: true }],
      'no-console': ['warn', { 'allow': ['warn', 'error'] }],
      'no-duplicate-imports': 'error',
      'no-multiple-empty-lines': ['error', { 'max': 1 }],
      'curly': 'error',
      'eqeqeq': ['error', 'always'],
      'prefer-const': 'error',
      'eol-last': ['error', 'always'],
    },
  },
  prettierConfig
];
