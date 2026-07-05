import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import svelte from 'eslint-plugin-svelte';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import ts from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				...globals.vitest,
			},
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
			},
		},
	},
	eslintPluginUnicorn.configs['recommended'],
	{
		rules: {
			'unicorn/consistent-boolean-name': 'off',
			'unicorn/error-message': 'off',
			'unicorn/filename-case': [
				'error',
				{
					case: 'kebabCase',
					ignore: [/^(.*)\.svelte$/],
				},
			],
			'unicorn/name-replacements': 'off',
			'unicorn/no-array-callback-reference': 'off',
			'unicorn/no-array-for-each': 'off',
			'unicorn/no-array-reduce': 'off',
			'unicorn/no-for-each': 'off',
			'unicorn/no-null': 'off',
			'unicorn/no-this-outside-of-class': 'off',
			'unicorn/no-top-level-assignment-in-function': 'off',
			'unicorn/prevent-abbreviations': 'off',
			'unicorn/prefer-iterator-to-array': 'off',
			'unicorn/prefer-ternary': 'off',
		},
	},
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'simple-import-sort/imports': [
				'warn',
				{ groups: [[String.raw`^\u0000`, '^node:', String.raw`^@?\w`, '^', String.raw`^\.`]] },
			],
			'simple-import-sort/exports': 'warn',
		},
	},
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ ignoreRestSiblings: true, varsIgnorePattern: '^_', argsIgnorePattern: '_' },
			],
			'no-console': ['warn', { allow: ['warn'] }],
			'svelte/prefer-svelte-reactivity': 'off',
		},
	},
	{
		files: ['tests/**'],
		rules: {
			'unicorn/no-global-object-property-assignment': 'off',
		},
	},
	prettier,
	...svelte.configs['flat/prettier'],
	{
		ignores: ['**/dist/**', '**/cache/**'],
	},
];
