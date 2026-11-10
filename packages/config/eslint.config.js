// Shared ESLint flat config for every Cadence workspace.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Modules that must never be imported from packages/domain (it stays pure). */
const DOMAIN_FORBIDDEN = [
  { name: 'mongoose', message: 'packages/domain is pure: no database access.' },
  { name: 'mongodb', message: 'packages/domain is pure: no database access.' },
  { name: 'react', message: 'packages/domain is pure: no UI frameworks.' },
  { name: '@confluentinc/kafka-javascript', message: 'packages/domain is pure: no Kafka.' },
  { name: 'kafkajs', message: 'packages/domain is pure: no Kafka.' },
  { name: 'pino', message: 'packages/domain is pure: no logging.' },
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/src/generated/**',
      '**/.turbo/**',
      '.claude/**',
      'openspec/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.strict.rules,
    },
  },
  {
    files: ['packages/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: DOMAIN_FORBIDDEN,
          patterns: [
            {
              // Subpath imports too, e.g. react-dom/client or mongodb/lib/...
              group: ['react*', 'mongodb/*', 'mongoose/*', 'pino/*', '@confluentinc/*'],
              message: 'packages/domain is pure: no I/O, UI or logging libraries.',
            },
            {
              group: ['**/apps/**', '@cadence/web', '@cadence/api', '@cadence/insights-worker'],
              message: 'packages/domain must not depend on apps.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='Date'][property.name='now']",
          message: 'Inject a Clock instead of calling Date.now() in packages/domain.',
        },
      ],
    },
  },
  {
    // Tests may read real time (e.g. to check systemClock) and print diagnostics.
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.int.test.ts', '**/scripts/**'],
    rules: { 'no-console': 'off', 'no-restricted-syntax': 'off' },
  },
  prettier,
);
