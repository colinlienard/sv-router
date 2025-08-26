import { searchParams } from '../src/index.js';

describe('searchParams', () => {
	it('should add a search param in the url', () => {
		searchParams.append('key', 'value');
		expect(globalThis.location.search).toBe('?key=value');
	});

	it('should get a search param from the url', () => {
		expect(searchParams.get('key')).toBe('value');
	});

	it('should set a search param from the url', () => {
		searchParams.set('key', 'value2');
		expect(globalThis.location.search).toBe('?key=value2');
	});

	it('should check if a search param exists in the url', () => {
		expect(searchParams.has('key')).toBe(true);
	});

	it('should delete a search param in the url', () => {
		searchParams.delete('key');
		expect(globalThis.location.search).toBe('');
	});

	it('should add search params of different types in the url', () => {
		searchParams.append('key', 'value');
		searchParams.append('number', 42);
		searchParams.append('boolean', true);
		expect(globalThis.location.search).toBe('?key=value&number=42&boolean=true');
	});

	it('should get search params of different types from the url', () => {
		expect(searchParams.get('key')).toBe('value');
		expect(searchParams.get('number')).toBe(42);
		expect(searchParams.get('boolean')).toBe(true);
	});

	it('should get search params values of different types', () => {
		expect([...searchParams.values()]).toEqual(['value', 42, true]);
	});

	it('should get search params entries of different types', () => {
		expect([...searchParams.entries()]).toEqual([
			['key', 'value'],
			['number', 42],
			['boolean', true],
		]);
	});

	it('should get all values of a search param', () => {
		expect(searchParams.getAll('number')).toEqual([42]);
	});
});
