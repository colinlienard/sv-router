import { router } from '../src/vite-plugin/plugin.js';

const loadConfigFromFile = vi.hoisted(() => vi.fn());
const writeRouterCode = vi.hoisted(() => vi.fn());

vi.mock('vite', () => ({
	loadConfigFromFile,
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
	genConfig.base = undefined;
	genConfig.routesInJs = false;
	genConfig.routesPath = 'src/routes';
	genConfig.ignore = [];
	await import('../src/cli/index.js');
	return genConfig;
}

/** @param {import('vite').PluginOption[]} plugins */
function mockViteConfig(plugins) {
	loadConfigFromFile.mockResolvedValue({ path: 'vite.config.ts', config: { plugins } });
}

describe('CLI', () => {
	beforeEach(() => {
		loadConfigFromFile.mockReset();
		writeRouterCode.mockReset();
		loadConfigFromFile.mockResolvedValue(null);
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

		it('should set base when --base is passed', async () => {
			const config = await runCli(['--base', 'my-app']);
			expect(config.base).toBe('my-app');
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
		it('should read router options from the vite config plugins', async () => {
			mockViteConfig([{ name: 'svelte' }, router({ allLazy: true, path: 'app/routes' })]);
			const config = await runCli([]);
			expect(config.allLazy).toBe(true);
			expect(config.routesPath).toBe('app/routes');
		});

		it('should find the router plugin in nested plugin options', async () => {
			mockViteConfig([false, [[router({ js: true })]]]);
			const config = await runCli([]);
			expect(config.routesInJs).toBe(true);
		});

		it('should not modify config when no vite config exists', async () => {
			loadConfigFromFile.mockResolvedValue(null);
			const config = await runCli([]);
			expect(config.allLazy).toBe(false);
			expect(config.routesInJs).toBe(false);
			expect(config.routesPath).toBe('src/routes');
		});

		it('should not modify config when the router plugin is not in vite config', async () => {
			mockViteConfig([{ name: 'svelte' }]);
			const config = await runCli([]);
			expect(config.allLazy).toBe(false);
		});

		it('should not modify config when the vite config fails to load', async () => {
			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			loadConfigFromFile.mockRejectedValue(new Error('boom'));
			const config = await runCli([]);
			expect(config.allLazy).toBe(false);
			expect(consoleWarn).toHaveBeenCalled();
			expect(writeRouterCode).toHaveBeenCalled();
			consoleWarn.mockRestore();
		});

		it('should silently skip the vite config when vite is not installed', async () => {
			const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			vi.doMock('vite', () => {
				throw new Error("Cannot find package 'vite'");
			});
			const config = await runCli([]);
			vi.doMock('vite', () => ({ loadConfigFromFile }));
			expect(config.allLazy).toBe(false);
			expect(consoleWarn).not.toHaveBeenCalled();
			expect(loadConfigFromFile).not.toHaveBeenCalled();
			expect(writeRouterCode).toHaveBeenCalled();
			consoleWarn.mockRestore();
		});

		it('should parse base option from vite config', async () => {
			mockViteConfig([router({ base: 'my-app' })]);
			const config = await runCli([]);
			expect(config.base).toBe('my-app');
		});

		it('should parse ignore option from vite config', async () => {
			mockViteConfig([router({ ignore: [/test/] })]);
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
