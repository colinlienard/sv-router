const existsSync = vi.hoisted(() => vi.fn());
const readFileSync = vi.hoisted(() => vi.fn());
const writeRouterCode = vi.hoisted(() => vi.fn());

vi.mock('node:fs', () => ({
	existsSync,
	readFileSync,
	default: { existsSync, readFileSync },
}));

vi.mock('../src/gen/write-router-code.js', () => ({
	writeRouterCode,
}));

/**
 * @param {string[]} args
 * @returns
 */
async function runCli(args = []) {
	vi.resetModules();
	process.argv = ['node', 'index.js', ...args];
	const { genConfig } = await import('../src/gen/config.js');
	genConfig.allLazy = false;
	genConfig.routesInJs = false;
	genConfig.routesPath = 'src/routes';
	genConfig.ignore = [];
	await import('../src/cli/index.js');
	return genConfig;
}

describe('CLI', () => {
	beforeEach(() => {
		existsSync.mockReset();
		readFileSync.mockReset();
		writeRouterCode.mockReset();
		existsSync.mockReturnValue(false);
	});

	describe('parseArgs', () => {
		it('should set allLazy when --allLazy is passed', async () => {
			const config = await runCli(['--allLazy', 'true']);
			expect(config.allLazy).toBe(true);
		});

		it('should set routesInJs when --js is passed', async () => {
			const config = await runCli(['--js', 'true']);
			expect(config.routesInJs).toBe(true);
		});

		it('should set routesPath when --path is passed', async () => {
			const config = await runCli(['--path', 'custom/routes']);
			expect(config.routesPath).toBe('custom/routes');
		});

		it('should set ignore when --ignore is passed', async () => {
			const config = await runCli(['--ignore', 'test,spec']);
			expect(config.ignore).toHaveLength(2);
			expect(config.ignore[0]).toBeInstanceOf(RegExp);
			expect(config.ignore[1]).toBeInstanceOf(RegExp);
		});

		it('should handle --path=value syntax', async () => {
			const config = await runCli(['--path=custom/path']);
			expect(config.routesPath).toBe('custom/path');
		});

		it('should handle multiple args', async () => {
			const config = await runCli(['--allLazy', 'true', '--js', 'true', '--path', 'app/routes']);
			expect(config.allLazy).toBe(true);
			expect(config.routesInJs).toBe(true);
			expect(config.routesPath).toBe('app/routes');
		});
	});

	describe('parseViteConfig', () => {
		it('should parse router config from vite.config.ts', async () => {
			existsSync.mockImplementation((p) => p.endsWith('vite.config.ts'));
			readFileSync.mockReturnValue(`
				import { router } from 'sv-router';
				export default defineConfig({
					plugins: [router({ allLazy: true, path: 'app/routes' })]
				});
			`);
			const config = await runCli([]);
			expect(config.allLazy).toBe(true);
			expect(config.routesPath).toBe('app/routes');
		});

		it('should parse router config from vite.config.js', async () => {
			existsSync.mockImplementation((p) => p.endsWith('vite.config.js'));
			readFileSync.mockReturnValue(`
				import { router } from 'sv-router';
				export default defineConfig({
					plugins: [router({ js: true })]
				});
			`);
			const config = await runCli([]);
			expect(config.routesInJs).toBe(true);
		});

		it('should not modify config when no vite config exists', async () => {
			existsSync.mockReturnValue(false);
			const config = await runCli([]);
			expect(config.allLazy).toBe(false);
			expect(config.routesInJs).toBe(false);
			expect(config.routesPath).toBe('src/routes');
		});

		it('should not modify config when router() is not in vite config', async () => {
			existsSync.mockImplementation((p) => p.endsWith('vite.config.ts'));
			readFileSync.mockReturnValue(`
				export default defineConfig({
					plugins: [svelte()]
				});
			`);
			const config = await runCli([]);
			expect(config.allLazy).toBe(false);
		});

		it('should parse ignore option from vite config', async () => {
			existsSync.mockImplementation((p) => p.endsWith('vite.config.ts'));
			readFileSync.mockReturnValue(`router({ ignore: [/test/] })`);
			const config = await runCli([]);
			expect(config.ignore).toHaveLength(1);
			expect(config.ignore[0]).toBeInstanceOf(RegExp);
		});
	});

	describe('writeRouterCode', () => {
		it('should always call writeRouterCode', async () => {
			await runCli([]);
			expect(writeRouterCode).toHaveBeenCalled();
		});

		it('should call writeRouterCode after parsing args', async () => {
			await runCli(['--allLazy', 'true']);
			expect(writeRouterCode).toHaveBeenCalled();
		});
	});
});
