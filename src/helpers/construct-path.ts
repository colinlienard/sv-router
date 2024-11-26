import type { PathParams } from '../types/types.ts';

export type ConstructPathArgs<T extends string> =
	PathParams<T> extends never ? [T] : [T, PathParams<T>];

export function constructPath<T extends string>(...args: ConstructPathArgs<T>): string {
	const [path, params] = args;
	if (!params) return path;

	let result = path as string;
	for (const key in params) {
		result = result.replace(`:${key}`, params[key]);
	}
	return result;
}
