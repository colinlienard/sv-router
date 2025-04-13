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
				...globals.jest,
				$state: false,
				$derived: false,
				$effect: false,
				$props: false,
				vi: false,
			},
		},
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser,
			},
		},
	},
	eslintPluginUnicorn.configs['flat/recommended'],
	{
		rules: {
			'unicorn/error-message': 'off',
			'unicorn/filename-case': [
				'error',
				{
					case: 'kebabCase',
					ignore: [/^(.*)\.svelte$/],
				},
			],
			'unicorn/no-array-reduce': 'off',
			'unicorn/prevent-abbreviations': 'off',
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
				{ ignoreRestSiblings: true, varsIgnorePattern: 'test_.*', argsIgnorePattern: '_' },
			],
			'no-console': ['warn', { allow: ['warn'] }],
		},
	},
	prettier,
	...svelte.configs['flat/prettier'],
	{
		ignores: ['**/dist/**', '**/cache/**'],
	},
];
