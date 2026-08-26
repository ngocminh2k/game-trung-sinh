import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Repository utilities run under Node, not the browser.  Keep the normal
    // recommended rules active while declaring only their real runtime globals.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    rules: {
      // Determinism guardrails: engine code must never touch wall-clock or
      // Math.random — all entropy lives in the injected GameState.
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'use state.rng via src/engine/rng.ts' },
        { object: 'Date', property: 'now', message: 'use state.day from GameState' },
        { object: 'document', property: 'querySelector', message: 'engine must stay DOM-free' },
      ],
    },
  },
)
