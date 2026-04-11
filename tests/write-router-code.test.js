import { writeRouterCode } from '../src/gen/write-router-code.js';

const existsSync = vi.hoisted(() => vi.fn());
const mkdirSync = vi.hoisted(() => vi.fn());
const readFileSync = vi.hoisted(() => vi.fn());
const writeFileSync = vi.hoisted(() => vi.fn());
const createRequire = vi.hoisted(() => vi.fn());

vi.mock('node:fs', () => ({
	default: { existsSync, mkdirSync, readFileSync, writeFileSync },
}));
vi.mock('node:module', () => ({ createRequire, default: { createRequire } }));
vi.mock('../src/gen/generate-router-code.js', () => ({
	generateRouterCode: () => 'generated code',
}));

/** @param {string | undefined} [version] */
function mockTypeScriptVersion(version) {
	if (version) {
		const resolve = vi.fn().mockReturnValue('/fake/node_modules/typescript/package.json');
		createRequire.mockReturnValue({ resolve });
		readFileSync.mockImplementation((/** @type {string} */ path) => {
			if (path === '/fake/node_modules/typescript/package.json') {
				return JSON.stringify({ version });
			}
			return '';
		});
	} else {
		createRequire.mockReturnValue({
			resolve: () => {
				throw new Error('Cannot find module');
			},
		});
		readFileSync.mockReturnValue('');
	}
}

/** @returns {{ compilerOptions: Record<string, unknown> }} */
function getWrittenTsConfig() {
	const call = writeFileSync.mock.calls.find(
		(/** @type {string[]} */ c) => c[0] === '.router/tsconfig.json',
	);
	return JSON.parse(call?.[1]);
}

describe('writeRouterCode', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		existsSync.mockReturnValue(false);
	});

	it('should include baseUrl for typescript < 6', () => {
		mockTypeScriptVersion('5.7.2');
		writeRouterCode();

		const tsConfig = getWrittenTsConfig();
		expect(tsConfig.compilerOptions.baseUrl).toBe('..');
		expect(tsConfig.compilerOptions.paths).toEqual({
			'sv-router/generated': ['.router/router.ts'],
		});
	});

	it('should not include baseUrl for typescript >= 6', () => {
		mockTypeScriptVersion('6.0.0');
		writeRouterCode();

		const tsConfig = getWrittenTsConfig();
		expect(tsConfig.compilerOptions.baseUrl).toBeUndefined();
		expect(tsConfig.compilerOptions.paths).toEqual({
			'sv-router/generated': ['./router.ts'],
		});
	});

	it('should include baseUrl when typescript is not installed', () => {
		mockTypeScriptVersion();
		writeRouterCode();

		const tsConfig = getWrittenTsConfig();
		expect(tsConfig.compilerOptions.baseUrl).toBe('..');
		expect(tsConfig.compilerOptions.paths).toEqual({
			'sv-router/generated': ['.router/router.ts'],
		});
	});

	it('should not include baseUrl for typescript prerelease >= 6', () => {
		mockTypeScriptVersion('6.0.0-beta.1');
		writeRouterCode();

		const tsConfig = getWrittenTsConfig();
		expect(tsConfig.compilerOptions.baseUrl).toBeUndefined();
		expect(tsConfig.compilerOptions.paths).toEqual({
			'sv-router/generated': ['./router.ts'],
		});
	});
});
