import { vi } from 'vitest';
import { searchParams } from '../src/index.js';
import { syncSearchParams } from '../src/search-params.svelte.js';

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

	it('should iterate with forEach', () => {
		/** @type {[string, string][]} */
		const entries = [];
		searchParams.forEach((value, key) => {
			entries.push([key, value]);
		});
		expect(entries).toEqual([
			['key', 'value'],
			['number', '42'],
			['boolean', 'true'],
		]);
	});

	it('should return keys', () => {
		expect([...searchParams.keys()]).toEqual(['key', 'number', 'boolean']);
	});

	it('should sort params', () => {
		searchParams.sort();
		expect(globalThis.location.search).toBe('?boolean=true&key=value&number=42');
	});

	it('should return toString', () => {
		expect(searchParams.toString()).toBe('boolean=true&key=value&number=42');
	});

	it('should return size', () => {
		expect(searchParams.size).toBe(3);
	});

	it('should be iterable with Symbol.iterator', () => {
		const entries = [...searchParams];
		expect(entries.length).toBe(3);
	});

	it('should return null for a non-existent key', () => {
		expect(searchParams.get('nonexistent')).toBe(null);
	});

	it('should delete all values for a key when no value is specified', () => {
		searchParams.append('multi', 'a');
		searchParams.append('multi', 'b');
		expect(searchParams.getAll('multi')).toEqual(['a', 'b']);
		searchParams.delete('multi');
		expect(searchParams.has('multi')).toBe(false);
	});

	it('should use replaceState when replace option is true', () => {
		const replaceStateSpy = vi.spyOn(globalThis.history, 'replaceState');
		searchParams.set('replaceTest', 'val', { replace: true });
		expect(replaceStateSpy).toHaveBeenCalled();
		replaceStateSpy.mockRestore();
		searchParams.delete('replaceTest');
	});

	it('should use pushState by default', () => {
		const pushStateSpy = vi.spyOn(globalThis.history, 'pushState');
		searchParams.set('pushTest', 'val');
		expect(pushStateSpy).toHaveBeenCalled();
		pushStateSpy.mockRestore();
		searchParams.delete('pushTest');
	});
});

describe('syncSearchParams', () => {
	beforeEach(() => {
		for (const key of searchParams.keys()) {
			searchParams.delete(key);
		}
	});

	it('should add new params from the search string', () => {
		syncSearchParams('foo=bar&baz=qux');
		expect(searchParams.get('foo')).toBe('bar');
		expect(searchParams.get('baz')).toBe('qux');
	});

	it('should remove params not present in the new search string', () => {
		searchParams.set('old', 'value');
		searchParams.set('stale', 'data');
		syncSearchParams('new=value');
		expect(searchParams.has('old')).toBe(false);
		expect(searchParams.has('stale')).toBe(false);
		expect(searchParams.get('new')).toBe('value');
	});

	it('should update existing params to new values', () => {
		searchParams.set('key', 'old');
		syncSearchParams('key=new');
		expect(searchParams.get('key')).toBe('new');
	});

	it('should not modify params when search string matches current state', () => {
		searchParams.set('a', '1');
		const spy = vi.spyOn(URLSearchParams.prototype, 'set');
		syncSearchParams('a=1');
		expect(spy).not.toHaveBeenCalled();
		spy.mockRestore();
	});

	it('should clear all params when syncing with empty string', () => {
		searchParams.set('x', '1');
		searchParams.set('y', '2');
		syncSearchParams('');
		expect(searchParams.has('x')).toBe(false);
		expect(searchParams.has('y')).toBe(false);
		expect(searchParams.size).toBe(0);
	});
});
