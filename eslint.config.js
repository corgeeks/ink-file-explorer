import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	// Base ESLint recommended rules
	eslint.configs.recommended,

	// TypeScript ESLint strict rules
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,

	// React plugin configuration
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
			'simple-import-sort': simpleImportSort,
		},
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				module: 'readonly',
				require: 'readonly',
			},
		},
		settings: {
			react: {
				version: '19.0',
			},
		},
		rules: {
			// React rules
			...reactPlugin.configs.recommended.rules,
			...reactPlugin.configs['jsx-runtime'].rules,

			// React Hooks rules
			...reactHooksPlugin.configs.recommended.rules,

			// Import sorting
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			// Customize strict rules if needed
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],

			// Allow explicit any in some cases (can be stricter if desired)
			'@typescript-eslint/no-explicit-any': 'warn',

			// React 19 doesn't require React in scope
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-react': 'off',

			// Allow unescaped quotes in JSX text
			'react/no-unescaped-entities': 'off',
		},
	},

	// Relaxed rules for test files
	{
		files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'react-hooks/rules-of-hooks': 'off', // Testing hooks often requires breaking these rules
		},
	},

	// Relaxed rules for examples
	{
		files: ['examples/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
		},
	},

	// Relaxed rules for library code with intentional patterns
	{
		files: ['src/lib/fileSystem.ts'],
		rules: {
			'no-control-regex': 'off', // Intentional control character validation
		},
	},

	// Relaxed rules for src code
	{
		files: ['src/**/*.{ts,tsx}'],
		rules: {
			// Allow setState in effects for scroll position management and similar cases
			'react-hooks/set-state-in-effect': 'warn',
		},
	},

	// Prettier config to disable conflicting rules (must be last)
	prettierConfig,

	// Ignore patterns
	{
		ignores: ['node_modules/**', 'dist/**', 'coverage/**', '*.config.js', '**/__snapshots__/**'],
	}
);
